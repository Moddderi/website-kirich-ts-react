import { Router } from "express";
import db from "../models/index.js";
import { buildCabinetOrder, generateAccessToken } from "../utils/cabinet.js";
import { cabinetUrl } from "../utils/links.js";
import { sendCabinetLinksEmail } from "../utils/email.js";
import { appendNotionBlocks, buildMeasurementBlocks } from "../utils/notionOrders.js";
import { sendTelegramText } from "../utils/telegram.js";
import {
  MEASUREMENT_UNIT_LABELS,
  getMeasurementSchemaForTypes,
  type MeasurementType,
} from "@project/shared";

const router = Router();

/* ---- tiny in-memory rate limit: 3 link requests / hour per e-mail and per IP ---- */
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

const limited = (key: string, max = 3): boolean => {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  hits.set(key, [...recent, now]);
  return false;
};

/**
 * "Find my order": e-mail → cabinet links of this client's custom orders.
 * Always answers the same, so nobody can find out which e-mails have orders.
 */
router.post("/request-link", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const ip = req.ip ?? "unknown";

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !limited(`e:${email}`) && !limited(`i:${ip}`)) {
    try {
      const orders = await db.Order.findAll({
        where: { orderType: "custom" },
        order: [["createdAt", "DESC"]],
        limit: 200,
      });
      const mine = orders
        .filter((o: any) => String(o.email).trim().toLowerCase() === email)
        .slice(0, 10);

      // Orders made before the cabinet existed have no link yet → issue one now
      for (const o of mine as any[]) {
        if (!o.accessToken) {
          o.accessToken = generateAccessToken();
          await o.update({ accessToken: o.accessToken });
        }
      }

      if (mine.length > 0) {
        void sendCabinetLinksEmail(
          email,
          mine.map((o: any) => ({
            number: String(o.id).split("-")[0].toUpperCase(),
            createdAt: o.createdAt,
            url: cabinetUrl(o.accessToken),
          })),
        );
      }
    } catch (error) {
      console.error("❌ request-link:", error);
    }
  }

  res.json({ success: true });
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
