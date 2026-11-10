import { Router } from "express";
import { getAvailability } from "../utils/availability.js";

const router = Router();

router.get("/", async (req, res) => {
  // ?days=N → length of the order; nearestStart is the first window that fits it
  const days = Math.min(365, Math.max(1, Math.floor(Number(req.query.days)) || 1));
  const availability = await getAvailability(days);
  // Browsers/CDN may cache briefly; the server has its own 5 min cache too.
  res.set("Cache-Control", "public, max-age=60");
  res.json(availability);
});

export default router;
