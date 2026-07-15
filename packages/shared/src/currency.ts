export type Currency = "UAH" | "USD" | "EUR";

export const CURRENCIES: Currency[] = ["UAH", "USD", "EUR"];

/** UAH amount is divided by this rate before markup */
export const UAH_TO_FOREIGN_RATE: Record<Exclude<Currency, "UAH">, number> = {
  USD: 40,
  EUR: 49,
};

/** Applied after the first rounding step */
export const CURRENCY_MARKUP = 1.4;

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
 * Foreign currency conversion:
 * 1. UAH / rate (USD: 40, EUR: 49)
 * 2. round up to nearest 10
 * 3. multiply by 1.4
 * 4. round up to nearest 10 again
 */
export const convertFromUah = (amountUah: number, currency: Currency): number => {
  if (currency === "UAH") {
    return Math.round(amountUah);
  }

  const rate = UAH_TO_FOREIGN_RATE[currency];
  const afterDivision = roundTo10(amountUah / rate);

  return roundTo10(afterDivision * CURRENCY_MARKUP);
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
