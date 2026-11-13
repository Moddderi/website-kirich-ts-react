import { runMeasurementsJob } from "./measurementsJob.js";
import { isNotionConfigured } from "../utils/notionAvailability.js";

const RUN_HOUR_KYIV = 9; // the studio's morning
const TICK_MS = 30 * 60 * 1000; // the check itself costs nothing (no network)

const kyivNow = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) % 24 };
};

let lastRunDay = "";

export const runDailyJobs = async () => {
  try {
    await runMeasurementsJob();
  } catch (error) {
    console.error("❌ Щоденна задача мірок:", error);
  }
};

/**
 * In-process daily scheduler (no extra service, no extra dependency).
 * Runs once a day after 09:00 Kyiv time; also catches up after a restart.
 * Only in production (or with RUN_JOBS=1) so local dev never touches the real Notion.
 */
export const startScheduler = () => {
  const enabled =
    (process.env.NODE_ENV === "production" || process.env.RUN_JOBS === "1") &&
    process.env.RUN_JOBS !== "0";
  if (!enabled || !isNotionConfigured()) return;

  const tick = () => {
    const { day, hour } = kyivNow();
    if (hour >= RUN_HOUR_KYIV && lastRunDay !== day) {
      lastRunDay = day;
      void runDailyJobs();
    }
  };

  setTimeout(tick, 60_000).unref();
  setInterval(tick, TICK_MS).unref();
  console.log("⏰ Щоденний планувальник запущено (мірки, 09:00 Київ)");
};
