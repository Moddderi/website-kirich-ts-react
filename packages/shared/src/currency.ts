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

export const formatPrice = (amountUah: number, currency: Currency): string => {
  const converted = convertFromUah(amountUah, currency);
  const symbol = CURRENCY_SYMBOLS[currency];

  return `${converted.toLocaleString("uk-UA")} ${symbol}`;
};
