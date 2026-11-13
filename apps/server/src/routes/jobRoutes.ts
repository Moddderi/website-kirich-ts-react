import crypto from "node:crypto";
import { Router } from "express";
import { runDailyJobs } from "../jobs/scheduler.js";

const router = Router();

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/**
 * Manual / external trigger of the daily jobs (e.g. GitHub Actions cron or a
 * test run). Disabled unless CRON_SECRET is set; send it as `x-cron-secret`.
 */
router.post("/daily", async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    res.status(404).end();
    return;
  }
  if (!safeEqual(String(req.get("x-cron-secret") ?? ""), secret)) {
    res.status(401).end();
    return;
  }
  void runDailyJobs();
  res.json({ success: true });
});

export default router;
