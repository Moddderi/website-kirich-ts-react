import {
  PREPAYMENT_RATE,
  TAILORING_GARMENTS,
  calcTailoringEstimate,
  calcTailoringLinesEstimate,
  clampGarmentQty,
  clampLineQty,
  expandTailoringTypes,
  convertFromUah,
  formatConvertedPrice,
  formatDisplayPriceFrom,
  formatSiteCatalogLineLabelUk,
  isCurrency,
  type Currency,
  type MeasurementType,
  type TailoringLine,
} from "@project/shared";

export const TAILORING_TYPE_META: Record<
  MeasurementType,
  { label: string; category: string }
> = {
  body: { label: "Боді", category: "Комбідрези" },
  jacket: { label: "Піджак / жилет", category: "Плечові вироби (верх)" },
  pants: { label: "Штани", category: "Низ" },
  suit: { label: "Костюм", category: "Повноцінний комплект" },
};

const isTailoringType = (value: unknown): value is MeasurementType =>
  typeof value === "string" && value in TAILORING_GARMENTS;

const isCatalogLine = (value: unknown): value is TailoringLine =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as TailoringLine).productId === "string" &&
  typeof (value as TailoringLine).quantity === "number";

/** "2027-03-22" → "22.03.2027" */
export const formatDateUk = (iso?: string | null): string => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

export interface CustomOrderSummary {
  currency: Currency;
  types: MeasurementType[];
  lines: Array<{
    type: MeasurementType;
    label: string;
    category: string;
    priceRange: string;
    leadDays: string;
  }>;
  priceRange: string;
  prepaymentRange: string;
  prepaymentPercent: number;
  /** In-stock accessories are paid in full and added on top of the 30% tailoring prepayment. */
  includesReadyAccessories?: boolean;
  leadDays: string;
  startDate: string;
  readyRange: string;
  comment: string;
}

const range = (from: number, _to: number, currency: Currency) =>
  formatDisplayPriceFrom(from, currency, "uk");

const daysRange = (min: number, max: number) => {
  const a = Math.ceil(min);
  const b = Math.ceil(max);
  return a === b ? `${a} дн.` : `${a}–${b} дн.`;
};

interface ReadyAccessoryRow {
  name: string;
  quantity: number;
  priceUah: number;
}

const readReadyAccessories = (order: { estimate?: { readyAccessories?: unknown } }): ReadyAccessoryRow[] => {
  const raw = order.estimate?.readyAccessories;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const item = row as { name?: unknown; quantity?: unknown; priceUah?: unknown };
    if (typeof item.name !== "string" || !item.name.trim()) return [];
    const priceUah = Number(item.priceUah);
    if (!Number.isFinite(priceUah)) return [];
    const quantity = Math.min(5, Math.max(1, Math.floor(Number(item.quantity) || 1)));
    return [{ name: item.name.trim(), quantity, priceUah }];
  });
};

const withReadyAccessories = (
  summary: CustomOrderSummary,
  extras: ReadyAccessoryRow[],
  currency: Currency,
  priceFrom: number,
  prepayFrom: number,
): CustomOrderSummary => {
  if (extras.length === 0) return summary;
  const extraTotal = extras.reduce(
    (sum, item) => sum + convertFromUah(item.priceUah, currency) * item.quantity,
    0,
  );
  return {
    ...summary,
    includesReadyAccessories: true,
    lines: [
      ...summary.lines,
      ...extras.map((item) => ({
        type: "jacket" as MeasurementType,
        label: item.quantity > 1 ? `${item.name} × ${item.quantity}` : item.name,
        category: "Аксесуар",
        priceRange: formatConvertedPrice(
          convertFromUah(item.priceUah, currency) * item.quantity,
          currency,
        ),
        leadDays: "в наявності",
      })),
    ],
    priceRange: range(priceFrom + extraTotal, priceFrom + extraTotal, currency),
    prepaymentRange: range(prepayFrom + extraTotal, prepayFrom + extraTotal, currency),
  };
};

/** Builds a display-ready summary of an individual tailoring order (Telegram / email). */
export const buildCustomOrderSummary = (order: any): CustomOrderSummary => {
  const currency: Currency = isCurrency(order.displayCurrency)
    ? order.displayCurrency
    : "UAH";

  const startDate: string | null = order.estimate?.startDate ?? null;
  const catalogLines = Array.isArray(order.estimate?.lines)
    ? order.estimate.lines.filter(isCatalogLine)
    : [];

  if (catalogLines.length > 0) {
    const leadDaysByProduct = order.estimate?.catalogLeadDays as
      | Record<string, number>
      | undefined;
    const estimate = calcTailoringLinesEstimate(
      catalogLines,
      currency,
      startDate,
      leadDaysByProduct ?? null,
    );

    const types = [
      ...new Set(estimate.items.map((item) => item.type)),
    ] as MeasurementType[];

    const catalogSummary: CustomOrderSummary = {
      currency,
      types,
      lines: catalogLines.map((line: TailoringLine) => {
        const qty = clampLineQty(line.quantity);
        const items = estimate.items.filter(
          (item) => item.productId === line.productId,
        );
        const priceFrom = items.reduce((acc, item) => acc + item.priceFrom, 0);
        const leadMin = items.reduce((acc, item) => acc + item.leadDaysMin, 0);
        const leadMax = items.reduce((acc, item) => acc + item.leadDaysMax, 0);
        const type = items[0]?.type ?? "body";
        return {
          type,
          label: formatSiteCatalogLineLabelUk(line.productId, qty),
          category: "Сайт",
          priceRange: range(priceFrom, priceFrom, currency),
          leadDays: daysRange(leadMin, leadMax),
        };
      }),
      priceRange: range(estimate.priceFrom, estimate.priceTo, currency),
      prepaymentRange: range(
        estimate.prepaymentFrom,
        estimate.prepaymentTo,
        currency,
      ),
      prepaymentPercent: Math.round(PREPAYMENT_RATE * 100),
      leadDays: daysRange(estimate.leadDaysMin, estimate.leadDaysMax),
      startDate: startDate ? formatDateUk(startDate) : "уточнюється менеджером",
      readyRange: estimate.readyFrom
        ? `${formatDateUk(estimate.readyFrom)} – ${formatDateUk(estimate.readyTo)}`
        : "уточнюється менеджером",
      comment: typeof order.comment === "string" ? order.comment.trim() : "",
    };
    return withReadyAccessories(
      catalogSummary,
      readReadyAccessories(order),
      currency,
      estimate.priceFrom,
      estimate.prepaymentFrom,
    );
  }

  let types: MeasurementType[] = Array.isArray(order.estimate?.types)
    ? order.estimate.types.filter(isTailoringType)
    : [];

  if (types.length === 0) {
    types = (order.items ?? [])
      .map((item: { name?: string }) =>
        item?.name?.match(/:\s*([^:]+)$/)?.[1]?.trim().toLowerCase(),
      )
      .filter(isTailoringType);
  }

  const quantities = (order.estimate?.quantities ?? {}) as Partial<
    Record<MeasurementType, number>
  >;
  const expanded = expandTailoringTypes(types, quantities);
  const estimate = calcTailoringEstimate(
    expanded,
    currency,
    startDate,
    order.estimate?.workDays ?? null,
  );

  const legacySummary: CustomOrderSummary = {
    currency,
    types,
    lines: types.map((type) => {
      const qty = clampGarmentQty(quantities[type]);
      const itemsOfType = estimate.items.filter((item) => item.type === type);
      const priceFrom = itemsOfType.reduce((acc, item) => acc + item.priceFrom, 0);
      const priceTo = itemsOfType.reduce((acc, item) => acc + item.priceTo, 0);
      const leadMin = itemsOfType.reduce((acc, item) => acc + item.leadDaysMin, 0);
      const leadMax = itemsOfType.reduce((acc, item) => acc + item.leadDaysMax, 0);
      const baseLabel = order.estimate?.programs?.[type]
        ? `${TAILORING_TYPE_META[type].label} · ${order.estimate.programs[type]}`
        : TAILORING_TYPE_META[type].label;
      return {
        type,
        ...TAILORING_TYPE_META[type],
        label: qty > 1 ? `${baseLabel} × ${qty}` : baseLabel,
        priceRange: range(priceFrom, priceTo, currency),
        leadDays: daysRange(leadMin, leadMax),
      };
    }),
    priceRange: range(estimate.priceFrom, estimate.priceTo, currency),
    prepaymentRange: range(
      estimate.prepaymentFrom,
      estimate.prepaymentTo,
      currency,
    ),
    prepaymentPercent: Math.round(PREPAYMENT_RATE * 100),
    leadDays: daysRange(estimate.leadDaysMin, estimate.leadDaysMax),
    startDate: startDate ? formatDateUk(startDate) : "уточнюється менеджером",
    readyRange: estimate.readyFrom
      ? `${formatDateUk(estimate.readyFrom)} – ${formatDateUk(estimate.readyTo)}`
      : "уточнюється менеджером",
    comment: typeof order.comment === "string" ? order.comment.trim() : "",
  };
  return withReadyAccessories(
    legacySummary,
    readReadyAccessories(order),
    currency,
    estimate.priceFrom,
    estimate.prepaymentFrom,
  );
};