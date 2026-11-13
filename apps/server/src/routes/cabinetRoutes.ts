import { Router } from "express";
import { Op, col, fn, where } from "sequelize";
import db from "../models/index.js";
import { buildCabinetOrder, generateAccessToken } from "../utils/cabinet.js";
import { sendLoginCodeEmail } from "../utils/email.js";
import {
  createLoginCode,
  createSessionToken,
  verifyLoginCode,
  verifySessionToken,
} from "../utils/auth.js";
import { appendNotionBlocks, buildMeasurementBlocks } from "../utils/notionOrders.js";
import { sendTelegramText } from "../utils/telegram.js";
import {
  MEASUREMENT_UNIT_LABELS,
  getMeasurementSchemaForTypes,
  type MeasurementType,
} from "@project/shared";

const router = Router();

/* ---- tiny in-memory rate limit (per key, sliding window) ---- */
const hits = new Map<string, number[]>();

const limited = (key: string, max: number, windowMs = 60 * 60 * 1000): boolean => {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  hits.set(key, [...recent, now]);
  return false;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normEmail = (v: unknown) => String(v ?? "").trim().toLowerCase();

const findCustomOrders = (email: string) =>
  db.Order.findAll({
    where: {
      orderType: "custom",
      [Op.and]: [where(fn("lower", col("email")), email)],
    },
    order: [["createdAt", "DESC"]],
    limit: 20,
  });

/**
 * Login step 1: e-mail → 6-digit code. Always answers the same, so nobody can
 * find out which e-mails have orders. A code is only sent when orders exist.
 */
router.post("/login/request", async (req, res) => {
  const email = normEmail(req.body?.email);
  const ip = req.ip ?? "unknown";

  if (EMAIL_RE.test(email) && !limited(`req:e:${email}`, 5) && !limited(`req:i:${ip}`, 30)) {
    try {
      const count = await db.Order.count({
        where: {
          orderType: "custom",
          [Op.and]: [where(fn("lower", col("email")), email)],
        },
      });
      if (count > 0) void sendLoginCodeEmail(email, createLoginCode(email));
    } catch (error) {
      console.error("❌ login/request:", error);
    }
  }

  res.json({ success: true });
});

/** Login step 2: e-mail + code → 90-day session token. */
router.post("/login/verify", (req, res) => {
  const email = normEmail(req.body?.email);
  const code = String(req.body?.code ?? "");
  const ip = req.ip ?? "unknown";
  const FIFTEEN_MIN = 15 * 60 * 1000;

  if (
    !EMAIL_RE.test(email) ||
    limited(`ver:e:${email}`, 8, FIFTEEN_MIN) ||
    limited(`ver:i:${ip}`, 40, FIFTEEN_MIN)
  ) {
    res.status(429).json({ success: false });
    return;
  }

  if (!verifyLoginCode(email, code)) {
    res.status(401).json({ success: false });
    return;
  }

  res.json({ success: true, token: createSessionToken(email) });
});

/** The signed-in client's orders (no Notion calls: status is shown inside an order). */
router.get("/session/orders", async (req, res) => {
  const email = verifySessionToken(
    String(req.headers.authorization ?? "").replace(/^Bearer\s+/i, ""),
  );
  if (!email) {
    res.status(401).json({ success: false });
    return;
  }

  try {
    const orders: any[] = await findCustomOrders(email);

    // Orders made before the cabinet existed have no link yet → issue one now
    for (const o of orders) {
      if (!o.accessToken) {
        o.accessToken = generateAccessToken();
        await o.update({ accessToken: o.accessToken });
      }
    }

    res.set("Cache-Control", "no-store");
    res.json({
      success: true,
      data: orders.map((o) => ({
        token: o.accessToken,
        number: String(o.id).split("-")[0].toUpperCase(),
        createdAt: o.createdAt,
        garments: (Array.isArray(o.estimate?.types) ? o.estimate.types : []).map(
          (type: string) => ({ type, program: o.estimate?.programs?.[type] ?? "ST" }),
        ),
        start: o.estimate?.startDate ?? null,
        readyTo: o.estimate?.readyTo ?? null,
      })),
    });
  } catch (error) {
    console.error("❌ session/orders:", error);
    res.status(500).json({ success: false });
  }
});

/** Order status for the client, by the secret token from the e-mail link. */
router.get("/:token", async (req, res) => {
  const token = String(req.params.token);
  if (token.length < 20) {
    res.status(404).json({ success: false });
    return;
  }

  try {
    const order = await db.Order.findOne({ where: { accessToken: token } });
    if (!order) {
      res.status(404).json({ success: false });
      return;
    }
    res.set("Cache-Control", "no-store");
    res.json({ success: true, data: await buildCabinetOrder(order) });
  } catch (error) {
    console.error("❌ cabinet:", error);
    res.status(500).json({ success: false });
  }
});

/** The client sends fresh measurements from the cabinet form. */
router.post("/:token/measurements", async (req, res) => {
  const token = String(req.params.token);
  if (token.length < 20 || limited(`m:${token}`, 10)) {
    res.status(token.length < 20 ? 404 : 429).json({ success: false });
    return;
  }

  try {
    const order: any = await db.Order.findOne({ where: { accessToken: token } });
    if (!order) {
      res.status(404).json({ success: false });
      return;
    }

    const estimate: any = order.estimate ?? {};
    if (!estimate.measurementsPending) {
      res.status(409).json({ success: false, message: "Мірки вже передано." });
      return;
    }

    const unit = req.body?.unit === "in" ? "in" : "cm";
    const types = (Array.isArray(estimate.types) ? estimate.types : []) as MeasurementType[];
    const parsed = getMeasurementSchemaForTypes(types, unit).safeParse(
      req.body?.values ?? {},
    );
    if (!parsed.success) {
      res.status(400).json({ success: false, issues: parsed.error.issues });
      return;
    }

    const values = Object.fromEntries(
      Object.entries(parsed.data).map(([k, v]) => [k, String(v)]),
    );
    const measurements = { unit, values };

    await db.OrderItem.update({ measurements }, { where: { orderId: order.id } });
    await order.update({
      estimate: {
        ...estimate,
        measurementsPending: false,
        measurementsSubmittedAt: new Date().toISOString(),
      },
    });

    // Studio side: add to the Notion page + tell the managers (never blocks the client)
    const date = new Date().toLocaleDateString("uk-UA");
    if (order.notionPageId) {
      void appendNotionBlocks(
        order.notionPageId,
        buildMeasurementBlocks(
          measurements,
          "",
          `Мірки від клієнта (${MEASUREMENT_UNIT_LABELS[unit]}) — ${date}`,
        ),
      ).catch((error) =>
        console.error("❌ Не вдалося додати мірки в Notion:", error),
      );
    }
    void sendTelegramText(
      `📏 ${order.lastName} ${order.firstName} передав(ла) мірки через кабінет. Вони додані на сторінку замовлення в Notion.`,
    );

    res.set("Cache-Control", "no-store");
    res.json({ success: true, data: await buildCabinetOrder(order) });
  } catch (error) {
    console.error("❌ cabinet measurements:", error);
    res.status(500).json({ success: false });
  }
});

export default router;
