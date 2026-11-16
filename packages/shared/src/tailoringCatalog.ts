import type { MeasurementType } from "./measurements.schema.js";
import { convertFromUah, type Currency } from "./currency.js";
import {
  PREPAYMENT_RATE,
  addDaysISO,
  addWorkDaysISO,
  type TailoringEstimate,
  type TailoringEstimateItem,
  type TailoringProgram,
} from "./tailoring.js";

/** Конкурсний vs тренувальний — один режим на замовлення. */
export type TailoringCategory = "competition" | "training";

export type TailoringProductId = string;

export interface TailoringProduct {
  id: TailoringProductId;
  category: TailoringCategory;
  program: TailoringProgram;
  /** For measurement forms (maps to MEASUREMENT_CONFIG). */
  measurementType: MeasurementType;
  priceFromUah: number;
  /** If omitted, equals priceFromUah («від …»). */
  priceToUah?: number;
  leadDaysMin: number;
  leadDaysMax: number;
  /** Selecting this clears other pieces (комплект). */
  isKit?: boolean;
  /** Only made in-studio with fittings (фрак). */
  studioOnly?: boolean;
}

/**
 * Fixed studio price list & lead times (aligned with Notion; edit here, not fetched live).
 * >>> UPDATE prices / days when the studio changes the price list <<<
 */
export const TAILORING_CATALOG: TailoringProduct[] = [
  // —— Competition · Standard ——
  {
    id: "competition.st.body",
    category: "competition",
    program: "ST",
    measurementType: "body",
    priceFromUah: 4940,
    leadDaysMin: 2,
    leadDaysMax: 2,
  },
  {
    id: "competition.st.jacket",
    category: "competition",
    program: "ST",
    measurementType: "jacket",
    priceFromUah: 5980,
    leadDaysMin: 3,
    leadDaysMax: 3,
  },
  {
    id: "competition.st.pants",
    category: "competition",
    program: "ST",
    measurementType: "pants",
    priceFromUah: 4290,
    leadDaysMin: 2,
    leadDaysMax: 2,
  },
  {
    id: "competition.st.accessories",
    category: "competition",
    program: "ST",
    measurementType: "jacket",
    priceFromUah: 650,
    leadDaysMin: 0.25,
    leadDaysMax: 0.25,
  },
  {
    id: "competition.st.kit",
    category: "competition",
    program: "ST",
    measurementType: "suit",
    priceFromUah: 15860,
    leadDaysMin: 7,
    leadDaysMax: 7,
    isKit: true,
  },
  {
    id: "competition.st.frock",
    category: "competition",
    program: "ST",
    measurementType: "suit",
    priceFromUah: 52000,
    leadDaysMin: 20,
    leadDaysMax: 20,
    studioOnly: true,
  },
  // —— Competition · Latin ——
  {
    id: "competition.lat.shirt",
    category: "competition",
    program: "LAT",
    measurementType: "body",
    priceFromUah: 6370,
    leadDaysMin: 2,
    leadDaysMax: 2,
  },
  {
    id: "competition.lat.pants",
    category: "competition",
    program: "LAT",
    measurementType: "pants",
    priceFromUah: 4290,
    leadDaysMin: 2,
    leadDaysMax: 2,
  },
  {
    id: "competition.lat.vest",
    category: "competition",
    program: "LAT",
    measurementType: "jacket",
    priceFromUah: 5980,
    leadDaysMin: 3,
    leadDaysMax: 3,
  },
  {
    id: "competition.lat.accessories",
    category: "competition",
    program: "LAT",
    measurementType: "jacket",
    priceFromUah: 650,
    leadDaysMin: 0.25,
    leadDaysMax: 0.25,
  },
  {
    id: "competition.lat.golf_body",
    category: "competition",
    program: "LAT",
    measurementType: "body",
    priceFromUah: 4550,
    leadDaysMin: 2,
    leadDaysMax: 2,
  },
  // —— Training · Standard ——
  {
    id: "training.st.tshirt",
    category: "training",
    program: "ST",
    measurementType: "body",
    priceFromUah: 3380, // прайс «від 3380» — звірте з прайсом студії
    leadDaysMin: 1,
    leadDaysMax: 1,
  },
  {
    id: "training.st.shirt",
    category: "training",
    program: "ST",
    measurementType: "body",
    priceFromUah: 4160,
    leadDaysMin: 1,
    leadDaysMax: 1,
  },
  {
    id: "training.st.pants",
    category: "training",
    program: "ST",
    measurementType: "pants",
    priceFromUah: 4290,
    leadDaysMin: 2,
    leadDaysMax: 2,
  },
  {
    id: "training.st.kit",
    category: "training",
    program: "ST",
    measurementType: "suit",
    priceFromUah: 7670,
    leadDaysMin: 3,
    leadDaysMax: 3,
    isKit: true,
  },
  // —— Training · Latin ——
  {
    id: "training.lat.longsleeve",
    category: "training",
    program: "LAT",
    measurementType: "body",
    priceFromUah: 3640,
    leadDaysMin: 1,
    leadDaysMax: 1,
  },
  {
    id: "training.lat.tshirt",
    category: "training",
    program: "LAT",
    measurementType: "body",
    priceFromUah: 2990,
    leadDaysMin: 1,
    leadDaysMax: 1,
  },
  {
    id: "training.lat.pants",
    category: "training",
    program: "LAT",
    measurementType: "pants",
    priceFromUah: 4290,
    leadDaysMin: 2,
    leadDaysMax: 2,
  },
  {
    id: "training.lat.kit",
    category: "training",
    program: "LAT",
    measurementType: "suit",
    priceFromUah: 7280,
    leadDaysMin: 3,
    leadDaysMax: 3,
    isKit: true,
  },
];

const catalogById = new Map(
  TAILORING_CATALOG.map((p) => [p.id, p] as const),
);

export const getTailoringProduct = (id: string): TailoringProduct | undefined =>
  catalogById.get(id);

export const listTailoringProducts = (
  category: TailoringCategory,
  program: TailoringProgram,
): TailoringProduct[] =>
  TAILORING_CATALOG.filter(
    (p) => p.category === category && p.program === program,
  );

export interface TailoringLine {
  productId: TailoringProductId;
  quantity: number;
}

export const clampLineQty = (n: number) =>
  Math.min(5, Math.max(1, Math.floor(n) || 1));

/** Expand lines to measurement types (for forms / legacy estimate paths). */
export const linesToMeasurementTypes = (lines: TailoringLine[]): MeasurementType[] =>
  lines.flatMap((line) => {
    const p = getTailoringProduct(line.productId);
    if (!p) return [];
    return Array.from({ length: clampLineQty(line.quantity) }, () => p.measurementType);
  });

export const uniqueMeasurementTypes = (lines: TailoringLine[]): MeasurementType[] => {
  const seen = new Set<MeasurementType>();
  const out: MeasurementType[] = [];
  for (const line of lines) {
    const p = getTailoringProduct(line.productId);
    if (!p || seen.has(p.measurementType)) continue;
    seen.add(p.measurementType);
    out.push(p.measurementType);
  }
  return out;
};

const roundDays = (value: number) => Math.round(value * 100) / 100;
const roundTo10 = (value: number) => Math.round(value / 10) * 10;

/** Add/remove a catalog line (комплект replaces separate pieces). */
export const toggleTailoringLine = (
  lines: TailoringLine[],
  productId: TailoringProductId,
): TailoringLine[] => {
  const product = getTailoringProduct(productId);
  if (!product) return lines;

  const existing = lines.find((l) => l.productId === productId);
  if (existing) {
    return lines.filter((l) => l.productId !== productId);
  }

  let next = lines.filter((l) => l.productId !== productId);

  if (product.isKit) {
    next = next.filter((l) => {
      const other = getTailoringProduct(l.productId);
      if (!other) return true;
      if (other.isKit) {
        return !(
          other.category === product.category &&
          other.program === product.program
        );
      }
      return !(
        other.category === product.category && other.program === product.program
      );
    });
    return [...next, { productId, quantity: 1 }];
  }

  next = next.filter((l) => {
    const other = getTailoringProduct(l.productId);
    return !(
      other?.isKit &&
      other.category === product.category &&
      other.program === product.program
    );
  });
  return [...next, { productId, quantity: 1 }];
};

/** Ukrainian line label for Notion / Telegram (matches site catalog names). */
export const CATALOG_LABEL_UK: Record<string, string> = {
  "competition.st.body": "Боді",
  "competition.st.jacket": "Піджак / жилет",
  "competition.st.pants": "Штани",
  "competition.st.accessories": "Аксесуари",
  "competition.st.kit": "Комплект",
  "competition.st.frock": "Фрак",
  "competition.lat.shirt": "Сорочка",
  "competition.lat.pants": "Штани",
  "competition.lat.vest": "Жилет",
  "competition.lat.accessories": "Аксесуари",
  "competition.lat.golf_body": "Гольф-боді",
  "training.st.tshirt": "Футболка",
  "training.st.shirt": "Сорочка",
  "training.st.pants": "Штани",
  "training.st.kit": "Комплект",
  "training.lat.longsleeve": "Лонгслів",
  "training.lat.tshirt": "Футболка",
  "training.lat.pants": "Штани",
  "training.lat.kit": "Комплект",
};

export const formatSiteCatalogLineLabelUk = (
  productId: string,
  quantity = 1,
): string => {
  const p = getTailoringProduct(productId);
  if (!p) return productId;
  const kind = p.category === "competition" ? "Конкурс" : "Тренув";
  const garment = CATALOG_LABEL_UK[productId] ?? productId;
  const base = `${kind} · ${p.program} · ${garment}`;
  const qty = clampLineQty(quantity);
  return qty > 1 ? `${base} × ${qty}` : base;
};

/** Legacy measurement step: types / qty / ST|LAT per measurement form. */
export const deriveLegacyTailoringState = (
  lines: TailoringLine[],
): {
  types: MeasurementType[];
  quantities: Partial<Record<MeasurementType, number>>;
  programs: Partial<Record<MeasurementType, TailoringProgram>>;
} => {
  const types = uniqueMeasurementTypes(lines);
  const quantities: Partial<Record<MeasurementType, number>> = {};
  const programs: Partial<Record<MeasurementType, TailoringProgram>> = {};
  for (const line of lines) {
    const p = getTailoringProduct(line.productId);
    if (!p) continue;
    quantities[p.measurementType] =
      (quantities[p.measurementType] ?? 0) + clampLineQty(line.quantity);
    programs[p.measurementType] = p.program;
  }
  return { types, quantities, programs };
};

/** Price & lead times from the fixed catalog (not fetched from Notion). */
/** Working days per catalog line (from DB / Notion sync). */
export type CatalogLeadDaysByProductId = Record<string, number>;

export const calcTailoringLinesEstimate = (
  lines: TailoringLine[],
  currency: Currency,
  startDate: string | null,
  leadDaysByProductId?: CatalogLeadDaysByProductId | null,
): TailoringEstimate => {
  const items: TailoringEstimateItem[] = lines.flatMap((line) => {
    const p = getTailoringProduct(line.productId);
    if (!p) return [];
    const qty = clampLineQty(line.quantity);
    const priceFrom = convertFromUah(p.priceFromUah, currency);
    const priceTo = convertFromUah(
      p.priceToUah ?? p.priceFromUah,
      currency,
    );
    const synced = leadDaysByProductId?.[p.id];
    const lead =
      typeof synced === "number" && Number.isFinite(synced)
        ? synced
        : p.leadDaysMin;
    const leadMax =
      typeof synced === "number" && Number.isFinite(synced)
        ? synced
        : p.leadDaysMax;
    return Array.from({ length: qty }, () => ({
      type: p.measurementType,
      productId: p.id,
      priceFrom,
      priceTo,
      leadDaysMin: lead,
      leadDaysMax: leadMax,
    }));
  });

  const sum = (pick: (item: TailoringEstimateItem) => number) =>
    items.reduce((acc, item) => acc + pick(item), 0);

  const priceFrom = sum((i) => i.priceFrom);
  const priceTo = sum((i) => i.priceTo);
  const leadDaysMin = roundDays(sum((i) => i.leadDaysMin));
  const leadDaysMax = roundDays(sum((i) => i.leadDaysMax));
  const readyWork = startDate
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