import { Router } from "express";
import { getAvailability } from "../utils/availability.js";

const router = Router();

router.get("/", async (_req, res) => {
  const availability = await getAvailability();
  // Browsers/CDN may cache briefly; the server has its own 5 min cache too.
  res.set("Cache-Control", "public, max-age=60");
  res.json(availability);
});

export default router;
