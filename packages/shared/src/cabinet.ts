import {
  clampLineQty,
  formatSiteCatalogLineLabelUk,
  getTailoringProduct,
  type TailoringLine,
} from "./tailoringCatalog.js";

/**
 * Client cabinet: stages of an individual tailoring order. The studio works in
 * Notion — its «Status» is mapped onto these stages (see server/utils/cabinet.ts).
 */
export const CABINET_STAGES = [
  "new", // Нове замовлення — заявку прийнято
  "awaiting_prepayment", // Очікує передплати
  "booked", // Заброньовано — чекаємо дати
  "measurements", // Планове зняття мірок
  "in_progress", // В роботі
  "awaiting_payment", // Очікує розрахунку
  "ready", // Готове до відправлення / видачі
  "done", // Відправлено / видано
] as const;

export type CabinetStage = (typeof CABINET_STAGES)[number];

export type CabinetGarment = {
  type: string;
  program: "ST" | "LAT";
  quantity: number;
  /** Full catalog line when the order was placed via the product catalog. */
  label?: string;
  productId?: string;
};

const isCatalogLine = (value: unknown): value is TailoringLine =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as TailoringLine).productId === "string";

/** Garment rows for the client cabinet (catalog lines or legacy types). */
export const buildCabinetGarments = (estimate: {
  lines?: unknown;
  types?: unknown;
  programs?: Partial<Record<string, "ST" | "LAT">>;
  quantities?: Partial<Record<string, number>>;
}): CabinetGarment[] => {
  const catalogLines = Array.isArray(estimate.lines)
    ? estimate.lines.filter(isCatalogLine)
    : [];

  if (catalogLines.length > 0) {
    return catalogLines.flatMap((line) => {
      const product = getTailoringProduct(line.productId);
      if (!product) return [];
      const quantity = clampLineQty(line.quantity);
      return [
        {
          type: product.measurementType,
          program: product.program,
          quantity,
          productId: line.productId,
          label: formatSiteCatalogLineLabelUk(line.productId, quantity),
        },
      ];
    });
  }

  const types: string[] = Array.isArray(estimate.types) ? estimate.types : [];
  const programs = estimate.programs ?? {};
  const quantities = estimate.quantities ?? {};

  return types.map((type) => ({
    type,
    program: programs[type] === "LAT" ? "LAT" : "ST",
    quantity: Math.max(1, Math.floor(Number(quantities[type]) || 1)),
  }));
};

export interface CabinetOrder {
  /** short public number: Notion number or the first block of the order id */
  number: string;
  firstName: string;
  createdAt: string;
  stage: CabinetStage;
  garments: CabinetGarment[];
  accessories: Array<{ name: string; quantity: number; size?: string | null }>;
  dates: {
    start: string | null;
    readyTo: string | null;
    measurementsDue: string | null;
  };
  measurements: {
    /** the order is waiting for the client's measurements now */
    needed: boolean;
    submitted: boolean;
    submittedAt: string | null;
  };
  /** Set when a gift certificate was redeemed for this order. */
  certificate: { code: string; discountUah: number } | null;
  /** false → status comes from the website only (Notion unavailable) */
  live: boolean;
}
