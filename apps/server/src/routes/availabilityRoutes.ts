import { Router } from "express";
import { getAvailability } from "../utils/availability.js";
import { getWorkDaysTable } from "../utils/notionOrders.js";

const router = Router();

const positiveNumber = (raw: unknown, max: number): number | null => {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.min(max, n) : null;
};

/** Production time (working days) per garment and ST/LAT, from the Notion price list. */
router.get("/work-days", async (_req, res) => {
  try {
    const table = await getWorkDaysTable();
    res.set("Cache-Control", "public, max-age=60");
    res.json({ table });
  } catch (error) {
    console.error("❌ Не вдалося завантажити терміни з Notion:", error);
    res.json({ table: null });
  }
});

router.get("/", async (req, res) => {
  // ?workDays=N → order length in working days (preferred);
  // ?days=N     → calendar-days fallback.
  const workDays = positiveNumber(req.query.workDays, 365);
  const days = Math.floor(positiveNumber(req.query.days, 365) ?? 1);
  const availability = await getAvailability({ windowDays: days, workDays });
  // Browsers/CDN may cache briefly; the server has its own 5 min cache too.
  res.set("Cache-Control", "public, max-age=60");
  res.json(availability);
});

export default router;
