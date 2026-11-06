import type { MeasurementType } from "./measurements.schema.js";
import { convertFromUah, type Currency } from "./currency.js";

/* -------------------------------------------------------------------------- */
/*  Garments: approximate prices (UAH) and production time                    */
/*  >>> EDIT THESE NUMBERS to match the studio's real prices / lead times <<< */
/* -------------------------------------------------------------------------- */

/** Dance program: ST = standard (Стандарт), LAT = Latin (Латина) */
export type TailoringProgram = "ST" | "LAT";
export const TAILORING_PROGRAMS: TailoringProgram[] = ["ST", "LAT"];

export const TAILORING_TYPES: MeasurementType[] = [
  "body",
  "jacket",
  "pants",
  "suit",
];

export interface TailoringGarmentInfo {
  /** approximate price range in UAH */
  priceFromUah: number;
  priceToUah: number;
  /** approximate production time in calendar days */
  leadDaysMin: number;
  leadDaysMax: number;
}

export const TAILORING_GARMENTS: Record<MeasurementType, TailoringGarmentInfo> =
  {
    body: {
      priceFromUah: 5000,
      priceToUah: 8000,
      leadDaysMin: 14,
      leadDaysMax: 21,
    },
    jacket: {
      priceFromUah: 6000,
      priceToUah: 10000,
      leadDaysMin: 14,
      leadDaysMax: 21,
    },
    pants: {
      priceFromUah: 3000,
      priceToUah: 5000,
      leadDaysMin: 7,
      leadDaysMax: 14,
    },
    suit: {
      priceFromUah: 9000,
      priceToUah: 15000,
      leadDaysMin: 21,
      leadDaysMax: 30,
    },
  };

/** Share of the order price that is paid upfront */
export const PREPAYMENT_RATE = 0.3;

/** Suit already contains jacket + pants, so they are mutually exclusive. */
export const toggleTailoringType = (
  current: MeasurementType[],
  toggled: MeasurementType,
): MeasurementType[] => {
  if (current.includes(toggled)) {
    return current.filter((type) => type !== toggled);
  }

  if (toggled === "suit") return ["suit"];

  return [...current.filter((type) => type !== "suit"), toggled];
};

/* -------------------------------------------------------------------------- */
/*  Dates (plain ISO "YYYY-MM-DD" strings, UTC math → no timezone surprises)   */
/* -------------------------------------------------------------------------- */

const DAY_MS = 24 * 60 * 60 * 1000;

const isoToUtc = (iso: string): number => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, (m ?? 1) - 1, d ?? 1);
};

export const addDaysISO = (iso: string, days: number): string =>
  new Date(isoToUtc(iso) + days * DAY_MS).toISOString().slice(0, 10);

/** Saturday / Sunday — the studio does not work (and cannot start an order). */
export const isWeekendISO = (iso: string): boolean => {
  const day = new Date(isoToUtc(iso)).getUTCDay();
  return day === 0 || day === 6;
};

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

/* -------------------------------------------------------------------------- */
/*  Studio availability (comes from a Google Sheet via the server)            */
/* -------------------------------------------------------------------------- */

export type AvailabilityStatus = "free" | "limited" | "busy";

export interface AvailabilityRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD (inclusive)
  status: AvailabilityStatus;
  note?: string;
}

export interface AvailabilityResponse {
  ranges: AvailabilityRange[];
  /** First day the studio can start a new order, or null if unknown */
  nearestStart: string | null;
  updatedAt: string;
  /** "notion" / "sheet" = real data, "unavailable" = not configured / unreachable */
  source: "notion" | "sheet" | "unavailable";
}

/** Later rows in the sheet override earlier ones. Days nobody mentioned are free. */
export const getStatusForDate = (
  ranges: AvailabilityRange[],
  iso: string,
): { status: AvailabilityStatus; note?: string } => {
  for (let i = ranges.length - 1; i >= 0; i--) {
    const range = ranges[i];
    if (iso >= range.from && iso <= range.to) {
      return { status: range.status, note: range.note };
    }
  }
  return { status: "free" };
};

export const findNearestStart = (
  ranges: AvailabilityRange[],
  fromISO: string = todayISO(),
  horizonDays = 1100,
): string | null => {
  for (let i = 0; i <= horizonDays; i++) {
    const day = addDaysISO(fromISO, i);
    if (isWeekendISO(day)) continue;
    if (getStatusForDate(ranges, day).status !== "busy") return day;
  }
  return null;
};

/* -------------------------------------------------------------------------- */
/*  Estimate (price range, prepayment, ready dates)                           */
/* -------------------------------------------------------------------------- */

export interface TailoringEstimateItem {
  type: MeasurementType;
  priceFrom: number;
  priceTo: number;
  leadDaysMin: number;
  leadDaysMax: number;
}

export interface TailoringEstimate {
  currency: Currency;
  items: TailoringEstimateItem[];
  priceFrom: number;
  priceTo: number;
  prepaymentFrom: number;
  prepaymentTo: number;
  leadDaysMin: number;
  leadDaysMax: number;
  startDate: string | null;
  readyFrom: string | null;
  readyTo: string | null;
}

const roundTo10 = (value: number) => Math.round(value / 10) * 10;

/**
 * All amounts are converted to the display currency PER GARMENT and then summed,
 * so the lines always add up to the total shown to the customer.
 */
export const calcTailoringEstimate = (
  types: MeasurementType[],
  currency: Currency,
  startDate: string | null,
): TailoringEstimate => {
  const items: TailoringEstimateItem[] = types.map((type) => {
    const info = TAILORING_GARMENTS[type];
    return {
      type,
      priceFrom: convertFromUah(info.priceFromUah, currency),
      priceTo: convertFromUah(info.priceToUah, currency),
      leadDaysMin: info.leadDaysMin,
      leadDaysMax: info.leadDaysMax,
    };
  });

  const sum = (pick: (item: TailoringEstimateItem) => number) =>
    items.reduce((acc, item) => acc + pick(item), 0);

  const priceFrom = sum((i) => i.priceFrom);
  const priceTo = sum((i) => i.priceTo);
  const leadDaysMin = sum((i) => i.leadDaysMin);
  const leadDaysMax = sum((i) => i.leadDaysMax);

  return {
    currency,
    items,
    priceFrom,
    priceTo,
    prepaymentFrom: roundTo10(priceFrom * PREPAYMENT_RATE),
    prepaymentTo: roundTo10(priceTo * PREPAYMENT_RATE),
    leadDaysMin,
    leadDaysMax,
    startDate,
    readyFrom: startDate ? addDaysISO(startDate, leadDaysMin) : null,
    readyTo: startDate ? addDaysISO(startDate, leadDaysMax) : null,
  };
};