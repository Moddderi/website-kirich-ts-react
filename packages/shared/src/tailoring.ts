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

/** Working days of production per garment (from the studio price list in Notion). */
export type WorkDaysByType = Partial<Record<MeasurementType, number>>;
export type WorkDaysTable = Record<TailoringProgram, WorkDaysByType>;

/** `n` working days after `iso` (Sat/Sun skipped). */
export const addWorkDaysISO = (iso: string, n: number): string => {
  let day = iso;
  let left = Math.max(0, Math.floor(n));
  while (left > 0) {
    day = addDaysISO(day, 1);
    if (!isWeekendISO(day)) left--;
  }
  return day;
};

const roundDays = (value: number) => Math.round(value * 100) / 100;

/**
 * Work days of the chosen garments (each with its own program), or null when
 * any of them is unknown → callers fall back to the static estimate.
 */
export const pickWorkDays = (
  table: WorkDaysTable | null | undefined,
  types: MeasurementType[],
  programs: Partial<Record<MeasurementType, TailoringProgram>>,
): WorkDaysByType | null => {
  if (!table || types.length === 0) return null;
  const result: WorkDaysByType = {};
  for (const type of types) {
    const days = table[programs[type] ?? "ST"]?.[type];
    if (typeof days !== "number" || !Number.isFinite(days)) return null;
    result[type] = days;
  }
  return result;
};

export const sumWorkDays = (workDays: WorkDaysByType | null | undefined): number | null => {
  if (!workDays) return null;
  const values = Object.values(workDays).filter(
    (v): v is number => typeof v === "number",
  );
  return values.length ? roundDays(values.reduce((a, b) => a + b, 0)) : null;
};

/** Orders starting later than this are bookings: measurements are taken closer to the start. */
export const FAR_ORDER_DAYS = 45;
/** How many days before the start the client is asked for fresh measurements. */
export const MEASUREMENTS_REMINDER_DAYS = 30;

export const daysBetweenISO = (fromISO: string, toISO: string): number =>
  Math.round((isoToUtc(toISO) - isoToUtc(fromISO)) / DAY_MS);

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

/**
 * First working day from which the studio can take an order that needs
 * `windowDays` calendar days: the start day itself and every working day up to
 * start + windowDays must be free. Single free days squeezed between other
 * orders are therefore skipped — the start moves to the end of the queue.
 */
/**
 * Can an order of `windowDays` calendar days / `workDays` working days start on `day`?
 * The start day must be a free working day and so must every working day of the order.
 */
export const canStartOn = (
  ranges: AvailabilityRange[],
  day: string,
  windowDays = 1,
  workDays: number | null = null,
): boolean => {
  const isBusy = (iso: string) => getStatusForDate(ranges, iso).status === "busy";
  if (isWeekendISO(day) || isBusy(day)) return false;

  // With known work days the order occupies exactly that many working days
  // (the start day is day 1); otherwise a calendar window is used.
  const end =
    workDays !== null
      ? addWorkDaysISO(day, Math.max(1, Math.ceil(roundDays(workDays))) - 1)
      : addDaysISO(day, Math.max(0, Math.floor(windowDays)));

  for (let d = addDaysISO(day, 1); d <= end; d = addDaysISO(d, 1)) {
    if (!isWeekendISO(d) && isBusy(d)) return false;
  }
  return true;
};

export const findNearestStart = (
  ranges: AvailabilityRange[],
  fromISO: string = todayISO(),
  horizonDays = 1100,
  windowDays = 1,
  workDays: number | null = null,
): string | null => {
  for (let i = 0; i <= horizonDays; i++) {
    const day = addDaysISO(fromISO, i);
    if (canStartOn(ranges, day, windowDays, workDays)) return day;
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
  workDays?: WorkDaysByType | null,
): TailoringEstimate => {
  // Real production time (working days, from the price list) when known for every garment
  const useWorkDays =
    !!workDays &&
    types.length > 0 &&
    types.every((type) => typeof workDays[type] === "number");

  const items: TailoringEstimateItem[] = types.map((type) => {
    const info = TAILORING_GARMENTS[type];
    return {
      type,
      priceFrom: convertFromUah(info.priceFromUah, currency),
      priceTo: convertFromUah(info.priceToUah, currency),
      leadDaysMin: useWorkDays ? (workDays![type] as number) : info.leadDaysMin,
      leadDaysMax: useWorkDays ? (workDays![type] as number) : info.leadDaysMax,
    };
  });

  const sum = (pick: (item: TailoringEstimateItem) => number) =>
    items.reduce((acc, item) => acc + pick(item), 0);

  const priceFrom = sum((i) => i.priceFrom);
  const priceTo = sum((i) => i.priceTo);
  const leadDaysMin = roundDays(sum((i) => i.leadDaysMin));
  const leadDaysMax = roundDays(sum((i) => i.leadDaysMax));
  const readyWork =
    useWorkDays && startDate
      ? addWorkDaysISO(startDate, Math.max(1, Math.ceil(leadDaysMax)) - 1)
      : null;

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
    readyFrom: readyWork ?? (startDate ? addDaysISO(startDate, leadDaysMin) : null),
    readyTo: readyWork ?? (startDate ? addDaysISO(startDate, leadDaysMax) : null),
  };
};

/** A booking far in the future: measurements are taken (and re-taken) later. */
export const isFarOrder = (
  startISO: string | null | undefined,
  fromISO: string = todayISO(),
): boolean => !!startISO && daysBetweenISO(fromISO, startISO) > FAR_ORDER_DAYS;
