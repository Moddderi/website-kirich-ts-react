const DEFAULT_CLIENT_URL = "https://kirich-sewing-studio.com";

/** Public address of the website (set CLIENT_URL on Railway / in local .env). */
export const clientUrl = (): string =>
  (process.env.CLIENT_URL || DEFAULT_CLIENT_URL).replace(/\/+$/, "");

/** Personal cabinet link of an order. */
export const cabinetUrl = (accessToken: string): string =>
  `${clientUrl()}/my-order/${accessToken}`;

/** Same URL with `_` encoded — Telegram legacy Markdown breaks on underscores in links. */
export const cabinetUrlForTelegram = (accessToken: string): string =>
  cabinetUrl(accessToken).replace(/_/g, "%5F");

/** Buyer cabinet for a purchased gift certificate. */
export const certificateCabinetUrl = (accessToken: string): string =>
  `${clientUrl()}/my-certificate/${accessToken}`;

/** Public congratulations page the buyer can send as a gift. */
export const giftShareUrl = (shareToken: string): string =>
  `${clientUrl()}/gift/${shareToken}`;
