import crypto from "node:crypto";
import type { CabinetOrder, CabinetStage } from "@project/shared";
import { isNotionConfigured } from "./notionAvailability.js";
import { notionRequest } from "./notionOrders.js";

/** Unguessable token for the personal cabinet link. */
export const generateAccessToken = (): string =>
  crypto.randomBytes(24).toString("base64url");

/** Notion «Status» option name → cabinet stage (by keywords, emoji are ignored). */
export const mapNotionStatus = (name: string | null | undefined): CabinetStage => {
  const s = (name ?? "").toLowerCase();
  if (/передпл|предоплат/.test(s)) return "awaiting_prepayment";
  if (/в черзі|черзі на пошит|заброньов|бронь/.test(s)) return "booked";
  // "примірки" (fitting) contains "мірки" → check it before measurements
  if (/примірк/.test(s)) return "in_progress";
  if (/зняття мірок|мірк/.test(s)) return "measurements";
  if (/в роботі|в работе/.test(s)) return "in_progress";
  if (/розрахун/.test(s)) return "awaiting_payment";
  if (/відправлено|видано/.test(s)) return "done";
  if (/готове/.test(s)) return "ready";
  return "new";
};

interface NotionOrderInfo {
  stage: CabinetStage;
  number: string | null;
  start: string | null;
  end: string | null;
  measurementsDue: string | null;
}

const CACHE_TTL_MS = 2 * 60 * 1000; // status changes rarely → fewer Notion calls
const cache = new Map<string, { info: NotionOrderInfo; at: number }>();

const findPropByType = (page: any, type: string, pattern?: RegExp) =>
  Object.entries<any>(page.properties ?? {}).find(
    ([name, prop]) => prop.type === type && (!pattern || pattern.test(name)),
  )?.[1];

/** Live status and dates of the order page in Notion (cached for a minute). */
export const getNotionOrderInfo = async (
  pageId: string,
): Promise<NotionOrderInfo | null> => {
  if (!isNotionConfigured()) return null;

  const hit = cache.get(pageId);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.info;

  const page = await notionRequest<any>(`/pages/${pageId}`, { method: "GET" });
  if (page.archived || page.in_trash) return null;

  const status = findPropByType(page, "status");
  const period = findPropByType(page, "date", /термін|виконан|deadline/i);
  const number = findPropByType(page, "number", /№|номер/i);
  const dueFormula = Object.entries<any>(page.properties ?? {}).find(
    ([name, prop]) => prop.type === "formula" && /мірок/i.test(name),
  )?.[1];

  const info: NotionOrderInfo = {
    stage: mapNotionStatus(status?.status?.name),
    number: typeof number?.number === "number" ? String(Math.floor(number.number)) : null,
    start: period?.date?.start ?? null,
    end: period?.date?.end ?? period?.date?.start ?? null,
    measurementsDue: dueFormula?.formula?.date?.start?.slice(0, 10) ?? null,
  };
  cache.set(pageId, { info, at: Date.now() });
  return info;
};

/** Everything the client may see about their order — no contacts, no address. */
export const buildCabinetOrder = async (order: any): Promise<CabinetOrder> => {
  const plain = typeof order.toJSON === "function" ? order.toJSON() : order;
  const estimate = plain.estimate ?? {};

  let info: NotionOrderInfo | null = null;
  if (plain.notionPageId) {
    try {
      info = await getNotionOrderInfo(plain.notionPageId);
    } catch (error) {
      console.error("❌ Кабінет: не вдалося прочитати Notion:", error);
    }
  }

  const types: string[] = Array.isArray(estimate.types) ? estimate.types : [];
  const programs: Record<string, "ST" | "LAT"> = estimate.programs ?? {};
  const stage = info?.stage ?? "new";

  const measurementsSubmitted = !estimate.measurementsPending;

  return {
    number: info?.number ?? String(plain.id).split("-")[0].toUpperCase(),
    firstName: plain.firstName,
    createdAt: new Date(plain.createdAt).toISOString(),
    stage,
    garments: types.map((type) => ({ type, program: programs[type] ?? "ST" })),
    dates: {
      start: info?.start ?? estimate.startDate ?? null,
      readyTo: info?.end ?? estimate.readyTo ?? null,
      measurementsDue: info?.measurementsDue ?? null,
    },
    measurements: {
      needed: stage === "measurements" && !measurementsSubmitted,
      submitted: measurementsSubmitted,
    },
    live: Boolean(info),
  };
};
