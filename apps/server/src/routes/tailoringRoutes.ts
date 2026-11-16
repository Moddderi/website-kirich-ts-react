import { Router } from "express";
import {
  loadCatalogLeadDays,
  syncCatalogLeadDaysFromNotion,
} from "../utils/catalogLeadDaysStore.js";

const router = Router();

router.get("/catalog-lead-days", async (_req, res) => {
  try {
    const data = await loadCatalogLeadDays();
    res.set("Cache-Control", "public, max-age=300");
    res.json({
      byProductId: data?.byProductId ?? {},
      syncedAt: data?.syncedAt ?? null,
    });
  } catch (error) {
    console.error("❌ catalog-lead-days:", error);
    res.json({ byProductId: {}, syncedAt: null });
  }
});

/** Re-read Notion price list and update DB (call after editing [DB] Прайс). */
router.post("/catalog-lead-days/sync", async (_req, res) => {
  try {
    const data = await syncCatalogLeadDaysFromNotion();
    if (!data) {
      res.status(503).json({ success: false, message: "Notion unavailable" });
      return;
    }
    res.json({ success: true, ...data });
  } catch (error) {
    console.error("❌ sync catalog-lead-days:", error);
    res.status(500).json({ success: false });
  }
});

export default router;