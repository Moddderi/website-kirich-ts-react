import {
  NOTION_CATALOG_PRICE_NAMES,
  TAILORING_CATALOG,
} from "@project/shared";
import db from "../models/index.js";
import { fetchNotionPriceDaysByName } from "./notionOrders.js";

export const CATALOG_LEAD_DAYS_KEY = "catalog_lead_days";

export interface CatalogLeadDaysPayload {
  byProductId: Record<string, number>;
  byNotionName: Record<string, number>;
  syncedAt: string;
  missingNames: string[];
  missingProducts: string[];
}

const roundDays = (value: number) => Math.round(value * 100) / 100;

/** Терміни, зафіксовані в каталозі сайту (не з Notion). */
export const applySiteLeadDayOverrides = (
  byProductId: Record<string, number>,
): Record<string, number> => {
  const next = { ...byProductId };
  const frock = TAILORING_CATALOG.find((p) => p.id === "competition.st.frock");
  if (frock) next[frock.id] = frock.leadDaysMin;
  return next;
};

let memoryCache: CatalogLeadDaysPayload | null = null;
let memoryAt = 0;
const MEMORY_TTL_MS = 5 * 60 * 1000;

export const buildCatalogLeadDaysFromNotion = (
  byNotionName: Record<string, number>,
): CatalogLeadDaysPayload => {
  const byProductId: Record<string, number> = {};
  const missingNames = new Set<string>();
  const missingProducts: string[] = [];

  for (const product of TAILORING_CATALOG) {
    const mapped = NOTION_CATALOG_PRICE_NAMES[product.id];
    if (!mapped) {
      missingProducts.push(product.id);
      continue;
    }
    const names = Array.isArray(mapped) ? mapped : [mapped];
    const values = names.map((name) => {
      const v = byNotionName[name];
      if (v === undefined) missingNames.add(name);
      return v;
    });
    if (values.some((v) => v === undefined)) {
      missingProducts.push(product.id);
      continue;
    }
    byProductId[product.id] = roundDays(
      (values as number[]).reduce((a, b) => a + b, 0),
    );
  }

  return {
    byProductId: applySiteLeadDayOverrides(byProductId),
    byNotionName,
    syncedAt: new Date().toISOString(),
    missingNames: [...missingNames],
    missingProducts,
  };
};

export const saveCatalogLeadDays = async (
  payload: CatalogLeadDaysPayload,
): Promise<void> => {
  const [row] = await db.StudioSetting.upsert({
    key: CATALOG_LEAD_DAYS_KEY,
    value: payload,
  });
  void row;
  memoryCache = payload;
  memoryAt = Date.now();
};

export const loadCatalogLeadDays = async (): Promise<CatalogLeadDaysPayload | null> => {
  if (memoryCache && Date.now() - memoryAt < MEMORY_TTL_MS) {
    return memoryCache;
  }
  const row = await db.StudioSetting.findByPk(CATALOG_LEAD_DAYS_KEY);
  if (!row) return null;
  const stored = row.value as CatalogLeadDaysPayload;
  const payload: CatalogLeadDaysPayload = {
    ...stored,
    byProductId: applySiteLeadDayOverrides(stored.byProductId ?? {}),
  };
  memoryCache = payload;
  memoryAt = Date.now();
  return payload;
};

/** Pull [DB] Прайс once and persist mapped catalog lead times. */
export const syncCatalogLeadDaysFromNotion = async (): Promise<CatalogLeadDaysPayload | null> => {
  const byNotionName = await fetchNotionPriceDaysByName();
  if (!byNotionName) return null;
  const payload = buildCatalogLeadDaysFromNotion(byNotionName);
  await saveCatalogLeadDays(payload);
  if (payload.missingNames.length) {
    console.warn(
      "⚠️ Notion price names not found:",
      payload.missingNames.join(", "),
    );
  }
  if (payload.missingProducts.length) {
    console.warn(
      "⚠️ Catalog products without lead days:",
      payload.missingProducts.join(", "),
    );
  }
  console.log(
    `✅ Catalog lead days synced (${Object.keys(payload.byProductId).length} items) at ${payload.syncedAt}`,
  );
  return payload;
};

/** On cold start: sync from Notion if the DB row is missing. */
export const ensureCatalogLeadDaysSynced = async (): Promise<void> => {
  const existing = await loadCatalogLeadDays();
  if (existing?.byProductId && Object.keys(existing.byProductId).length > 0) {
    return;
  }
  await syncCatalogLeadDaysFromNotion();
};