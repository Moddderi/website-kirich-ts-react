import {
  PREPAYMENT_RATE,
  TAILORING_GARMENTS,
  calcTailoringEstimate,
  formatConvertedPrice,
  isCurrency,
  type Currency,
  type MeasurementType,
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
  leadDays: string;
  startDate: string;
  readyRange: string;
  comment: string;
}

const range = (from: number, to: number, currency: Currency) =>
  from === to
    ? formatConvertedPrice(from, currency)
    : `${formatConvertedPrice(from, currency)} – ${formatConvertedPrice(to, currency)}`;

const daysRange = (min: number, max: number) =>
  min === max ? `${min} дн.` : `${min}–${max} дн.`;

/** Builds a display-ready summary of an individual tailoring order (Telegram / email). */
export const buildCustomOrderSummary = (order: any): CustomOrderSummary => {
  const currency: Currency = isCurrency(order.displayCurrency)
    ? order.displayCurrency
    : "UAH";

  // Preferred source: what we stored at creation time.
  let types: MeasurementType[] = Array.isArray(order.estimate?.types)
    ? order.estimate.types.filter(isTailoringType)
    : [];

  // Fallback for old orders: "Індивідуальний пошив: jacket" item names.
  if (types.length === 0) {
    types = (order.items ?? [])
      .map((item: { name?: string }) =>
        item?.name?.match(/:\s*([^:]+)$/)?.[1]?.trim().toLowerCase(),
      )
      .filter(isTailoringType);
  }

  const startDate: string | null = order.estimate?.startDate ?? null;
  const estimate = calcTailoringEstimate(types, currency, startDate);

  return {
    currency,
    types,
    lines: estimate.items.map((item) => ({
      type: item.type,
      ...TAILORING_TYPE_META[item.type],
      // "Штани · LAT" — program is chosen per garment on the site
      label: order.estimate?.programs?.[item.type]
        ? `${TAILORING_TYPE_META[item.type].label} · ${order.estimate.programs[item.type]}`
        : TAILORING_TYPE_META[item.type].label,
      priceRange: range(item.priceFrom, item.priceTo, currency),
      leadDays: daysRange(item.leadDaysMin, item.leadDaysMax),
    })),
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
};
