import {
  addDaysISO,
  todayISO,
  type AvailabilityRange,
  type AvailabilityStatus,
} from "@project/shared";

/**
 * Studio workload straight from the Notion orders database.
 *
 * Setup (see .env.example): NOTION_TOKEN + NOTION_DATABASE_ID, and the database
 * must be shared with the integration (… → Connections).
 *
 * How it works:
 *  - every order that is NOT in a "done" status and has a date range
 *    ("Термін виконання": start → end) occupies every day of that range;
 *  - for each day we count occupying orders and map it to free / limited / busy
 *    using NOTION_CAPACITY_LIMITED / NOTION_CAPACITY_BUSY;
 *  - only dates and statuses leave this module — never names, phones or prices.
 */

const NOTION_VERSION = "2022-06-28";
const FETCH_TIMEOUT_MS = 8000;
const MAX_PAGES = 30; // 30 × 100 = 3000 orders is plenty
const MAX_HORIZON_DAYS = 400;

export interface NotionOrderPeriod {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD (inclusive)
}

export interface NotionCapacityOptions {
  /** simultaneous orders from which the day is "limited"; null = never use "limited" */
  limitedFrom: number | null;
  /** simultaneous orders from which the day is "busy" (1 = one order at a time) */
  busyFrom: number;
}

/**
 * Accepts a bare id (with or without dashes) OR a full Notion link
 * (`https://www.notion.so/ws/Title-<32 hex>?v=<view id>`) and returns the
 * 32-char database id. The `?v=` part is the *view* id and is ignored.
 */
export const normalizeNotionId = (raw: string | undefined): string | null => {
  if (!raw) return null;
  const path = raw.trim().split(/[?#]/)[0];
  const matches = path.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32}/gi,
  );
  if (!matches || matches.length === 0) return null;
  return matches[matches.length - 1].replace(/-/g, "").toLowerCase();
};

export const isNotionConfigured = () =>
  Boolean(process.env.NOTION_TOKEN?.trim() && process.env.NOTION_DATABASE_ID);

const readInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Default: the studio works on ONE order at a time → any day covered by an
 * active order is "busy", and the first day after the last deadline is free.
 * Optional NOTION_CAPACITY_LIMITED (< BUSY) adds a "few slots" level.
 */
const getCapacity = (): NotionCapacityOptions => {
  const busyFrom = readInt(process.env.NOTION_CAPACITY_BUSY, 1);
  const limited = readInt(process.env.NOTION_CAPACITY_LIMITED, 0);
  return {
    busyFrom,
    limitedFrom: limited > 0 && limited < busyFrom ? limited : null,
  };
};

/** Statuses (case-insensitive, "contains") that mean the order no longer takes studio time. */
const getDoneStatuses = (): string[] =>
  (
    process.env.NOTION_DONE_STATUSES ||
    "Відправлено,Видано,Готове до,Скасовано,Скасований,Відмова,Завершено"
  )
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/* ----------------------------- Notion plumbing ---------------------------- */

interface NotionProperty {
  type: string;
  status?: { name?: string } | null;
  select?: { name?: string } | null;
  date?: { start?: string | null; end?: string | null } | null;
}

interface NotionPage {
  properties: Record<string, NotionProperty>;
}

interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

const normalizeDate = (raw?: string | null): string | null => {
  if (!raw) return null;
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
};

const findProperty = (
  props: Record<string, NotionProperty>,
  preferredName: string | undefined,
  types: string[],
  namePattern: RegExp,
): NotionProperty | null => {
  if (preferredName && props[preferredName]) return props[preferredName];
  const entry = Object.entries(props).find(
    ([name, prop]) => types.includes(prop.type) && namePattern.test(name),
  );
  return entry ? entry[1] : null;
};

/** Converts raw Notion pages to active order periods (pure, easy to test). */
export const extractOrderPeriods = (
  pages: NotionPage[],
  options: {
    statusProp?: string;
    periodProp?: string;
    doneStatuses: string[];
  },
): NotionOrderPeriod[] => {
  const periods: NotionOrderPeriod[] = [];

  for (const page of pages) {
    const props = page.properties ?? {};

    const periodProp = findProperty(
      props,
      options.periodProp,
      ["date"],
      /термін|дедлайн|deadline|due|виконан/i,
    );
    const from = normalizeDate(periodProp?.date?.start);
    const to = normalizeDate(periodProp?.date?.end) ?? from;
    if (!from || !to) continue;

    const statusProp = findProperty(
      props,
      options.statusProp,
      ["status", "select"],
      /status|статус/i,
    );
    const statusName = (
      statusProp?.status?.name ??
      statusProp?.select?.name ??
      ""
    ).toLowerCase();

    if (
      statusName &&
      options.doneStatuses.some((done) => statusName.includes(done))
    ) {
      continue;
    }

    periods.push(from <= to ? { from, to } : { from: to, to: from });
  }

  return periods;
};

/** Turns order periods into compact free/limited/busy ranges. Free days are omitted. */
export const buildRangesFromPeriods = (
  periods: NotionOrderPeriod[],
  capacity: NotionCapacityOptions,
  today: string = todayISO(),
): AvailabilityRange[] => {
  const relevant = periods.filter((p) => p.to >= today);
  if (relevant.length === 0) return [];

  const lastDay = relevant.reduce((max, p) => (p.to > max ? p.to : max), today);
  const ranges: AvailabilityRange[] = [];
  let current: AvailabilityRange | null = null;

  for (let i = 0; i <= MAX_HORIZON_DAYS; i++) {
    const day = addDaysISO(today, i);
    if (day > lastDay) break;

    const load = relevant.reduce(
      (sum, p) => (day >= p.from && day <= p.to ? sum + 1 : sum),
      0,
    );

    const status: AvailabilityStatus | null =
      load >= capacity.busyFrom
        ? "busy"
        : capacity.limitedFrom !== null && load >= capacity.limitedFrom
          ? "limited"
          : null;

    if (current && status === current.status && addDaysISO(current.to, 1) === day) {
      current.to = day;
      continue;
    }

    if (current) ranges.push(current);
    current = status ? { from: day, to: day, status } : null;
  }

  if (current) ranges.push(current);
  return ranges;
};

const queryDatabase = async (): Promise<NotionPage[]> => {
  const token = (process.env.NOTION_TOKEN as string).trim();
  const databaseId = normalizeNotionId(process.env.NOTION_DATABASE_ID);
  if (!databaseId) {
    throw new Error(
      "NOTION_DATABASE_ID is not a valid Notion id (expected 32 hex chars)",
    );
  }

  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://api.notion.com/v1/databases/${databaseId}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page_size: 100,
            ...(cursor ? { start_cursor: cursor } : {}),
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const hint =
          response.status === 404
            ? " (database not shared with the integration: open it → ··· → Connections, or wrong id)"
            : response.status === 401
              ? " (invalid NOTION_TOKEN)"
              : "";
        throw new Error(`Notion responded with ${response.status}${hint}`);
      }

      const json = (await response.json()) as NotionQueryResponse;
      pages.push(...json.results);

      if (!json.has_more || !json.next_cursor) break;
      cursor = json.next_cursor;
    } finally {
      clearTimeout(timer);
    }
  }

  return pages;
};

/** Public entry: ranges derived from the Notion orders database. Throws on failure. */
export const fetchNotionRanges = async (): Promise<AvailabilityRange[]> => {
  const pages = await queryDatabase();

  const periods = extractOrderPeriods(pages, {
    statusProp: process.env.NOTION_PROP_STATUS,
    periodProp: process.env.NOTION_PROP_PERIOD,
    doneStatuses: getDoneStatuses(),
  });

  return buildRangesFromPeriods(periods, getCapacity());
};
