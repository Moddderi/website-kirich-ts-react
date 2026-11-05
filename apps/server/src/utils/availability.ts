import dotenv from "dotenv";
dotenv.config();

import {
  findNearestStart,
  todayISO,
  type AvailabilityRange,
  type AvailabilityResponse,
  type AvailabilityStatus,
} from "@project/shared";

/**
 * Studio availability is edited by the owner in a Google Sheet:
 *   File → Share → Publish to web → choose the sheet → format "CSV" → copy link
 *   → put it into AVAILABILITY_SHEET_CSV_URL.
 *
 * Sheet columns (header names are case-insensitive, UA / EN both work):
 *   from | з      → first day of the period   (2026-11-05  or  05.11.2026)
 *   to   | по     → last day of the period    (inclusive)
 *   status | статус → free | limited | busy   (вільно | мало місць | зайнято)
 *   note | примітка → optional text
 *
 * Days that are not covered by any row are treated as FREE.
 * If rows overlap, the lower row wins.
 */

const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6000;

let cache: { data: AvailabilityResponse; fetchedAt: number } | null = null;

const HEADER_ALIASES: Record<string, string[]> = {
  from: ["from", "start", "з", "від", "початок"],
  to: ["to", "end", "по", "до", "кінець"],
  status: ["status", "статус"],
  note: ["note", "comment", "примітка", "коментар"],
};

const STATUS_ALIASES: Record<AvailabilityStatus, string[]> = {
  free: ["free", "open", "available", "вільно", "вільний", "відкрито", "є місця"],
  limited: ["limited", "few", "мало", "мало місць", "обмежено"],
  busy: ["busy", "full", "closed", "зайнято", "зайнятий", "закрито", "немає місць"],
};

/** Minimal RFC-4180 CSV parser (handles quotes and commas inside quotes). */
const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') inQuotes = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ""));
};

const pad = (n: number) => String(n).padStart(2, "0");

const parseDate = (raw: string): string | null => {
  const value = raw.trim();
  if (!value) return null;

  let match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) return `${match[1]}-${pad(+match[2])}-${pad(+match[3])}`;

  match = value.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (match) return `${match[3]}-${pad(+match[2])}-${pad(+match[1])}`;

  return null;
};

const parseStatus = (raw: string): AvailabilityStatus | null => {
  const value = raw.trim().toLowerCase();
  for (const [status, aliases] of Object.entries(STATUS_ALIASES)) {
    if (aliases.includes(value)) return status as AvailabilityStatus;
  }
  return null;
};

const findColumn = (header: string[], key: keyof typeof HEADER_ALIASES) =>
  header.findIndex((h) => HEADER_ALIASES[key].includes(h.trim().toLowerCase()));

export const parseAvailabilityCsv = (csv: string): AvailabilityRange[] => {
  const rows = parseCsv(csv.replace(/^\uFEFF/, ""));
  if (rows.length < 2) return [];

  const [header, ...body] = rows;
  const fromIdx = findColumn(header, "from");
  const toIdx = findColumn(header, "to");
  const statusIdx = findColumn(header, "status");
  const noteIdx = findColumn(header, "note");

  if (fromIdx === -1 || toIdx === -1 || statusIdx === -1) {
    console.warn(
      "⚠️ Availability sheet: потрібні колонки from/to/status (або з/по/статус).",
    );
    return [];
  }

  const ranges: AvailabilityRange[] = [];

  for (const row of body) {
    const from = parseDate(row[fromIdx] ?? "");
    const to = parseDate(row[toIdx] ?? "") ?? from;
    const status = parseStatus(row[statusIdx] ?? "");
    if (!from || !to || !status) continue;

    ranges.push({
      from: from <= to ? from : to,
      to: from <= to ? to : from,
      status,
      note: noteIdx !== -1 ? row[noteIdx]?.trim() || undefined : undefined,
    });
  }

  return ranges;
};

const buildResponse = (
  ranges: AvailabilityRange[],
  source: AvailabilityResponse["source"],
): AvailabilityResponse => ({
  ranges,
  nearestStart: source === "sheet" ? findNearestStart(ranges, todayISO()) : null,
  updatedAt: new Date().toISOString(),
  source,
});

export const getAvailability = async (): Promise<AvailabilityResponse> => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    // nearestStart depends on "today" → recompute cheaply on every call
    return {
      ...cache.data,
      nearestStart:
        cache.data.source === "sheet"
          ? findNearestStart(cache.data.ranges, todayISO())
          : null,
    };
  }

  const url = process.env.AVAILABILITY_SHEET_CSV_URL;
  if (!url) return buildResponse([], "unavailable");

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) throw new Error(`Sheet responded with ${response.status}`);

    const ranges = parseAvailabilityCsv(await response.text());
    const data = buildResponse(ranges, "sheet");
    cache = { data, fetchedAt: Date.now() };
    return data;
  } catch (error) {
    console.error("❌ Не вдалося завантажити таблицю доступності:", error);
    // Prefer stale data over showing nothing
    if (cache) return cache.data;
    return buildResponse([], "unavailable");
  }
};
