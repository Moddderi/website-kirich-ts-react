export type Currency = "UAH" | "USD" | "EUR";

export const CURRENCIES: Currency[] = ["UAH", "USD", "EUR"];

/** UAH amount is divided by this rate before markup */
export const UAH_TO_FOREIGN_RATE: Record<Exclude<Currency, "UAH">, number> = {
  USD: 40,
  EUR: 49,
};

/** USD: after first round-to-10 step */
export const USD_MARKUP = 1.4;
/** @deprecated Use USD_MARKUP — kept for imports */
export const CURRENCY_MARKUP = USD_MARKUP;

/** EUR: applied before the single round-to-10 step */
export const EUR_MARKUP = 1.3;

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  UAH: "₴",
  USD: "$",
  EUR: "€",
};

export const isCurrency = (value: unknown): value is Currency =>
  value === "UAH" || value === "USD" || value === "EUR";

const roundTo10 = (value: number): number =>
  Math.ceil(value / 10) * 10;

/**
 * USD: UAH / 40 → round up to 10 → ×1.4 → round up to 10.
 * EUR: UAH / 49 → ×1.3 → round up to 10 (single rounding).
 */
export const convertFromUah = (amountUah: number, currency: Currency): number => {
  if (currency === "UAH") {
    return Math.round(amountUah);
  }

  const rate = UAH_TO_FOREIGN_RATE[currency];

  if (currency === "EUR") {
    return roundTo10((amountUah / rate) * EUR_MARKUP);
  }

  const afterDivision = roundTo10(amountUah / rate);
  return roundTo10(afterDivision * USD_MARKUP);
};

/** Format an amount that is already in the target currency (no conversion). */
export const formatConvertedPrice = (
  amount: number,
  currency: Currency,
): string => {
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${Math.round(amount).toLocaleString("uk-UA")} ${symbol}`;
};

export const formatPrice = (amountUah: number, currency: Currency): string => {
  return formatConvertedPrice(convertFromUah(amountUah, currency), currency);
};

/** Display «from» price (already in target currency). */
export const formatDisplayPriceFrom = (
  amount: number,
  currency: Currency,
  locale: "uk" | "en" = "uk",
): string => {
  const prefix = locale === "en" ? "from" : "від";
  return `${prefix} ${formatConvertedPrice(amount, currency)}`;
};

export const formatPriceFromUah = (
  amountUah: number,
  currency: Currency,
  locale: "uk" | "en" = "uk",
): string =>
  formatDisplayPriceFrom(convertFromUah(amountUah, currency), currency, locale);

/**
 * Cart/checkout line: convert unit price once, then multiply by quantity.
 * Avoids double-rounding drift vs converting (price * qty) as one sum.
 */
export const convertLineFromUah = (
  unitPriceUah: number,
  quantity: number,
  currency: Currency,
): number => convertFromUah(unitPriceUah, currency) * quantity;

/** Sum of line totals after converting each unit price once — matches cart UI. */
export const convertCartTotalFromUah = (
  items: Array<{ price: number | string; quantity: number | string }>,
  currency: Currency,
): number =>
  items.reduce((sum, item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    if (!Number.isFinite(price) || !Number.isFinite(quantity)) return sum;
    return sum + convertLineFromUah(price, quantity, currency);
  }, 0);
