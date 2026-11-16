const DEFAULT_CLIENT_URL = "https://website-kirich-ts-react.vercel.app";

/** Public address of the website (set CLIENT_URL on Railway / in local .env). */
export const clientUrl = (): string =>
  (process.env.CLIENT_URL || DEFAULT_CLIENT_URL).replace(/\/+$/, "");

/** Personal cabinet link of an order. */
export const cabinetUrl = (accessToken: string): string =>
  `${clientUrl()}/my-order/${accessToken}`;

/** Same URL with `_` encoded — Telegram legacy Markdown breaks on underscores in links. */
export const cabinetUrlForTelegram = (accessToken: string): string =>
  cabinetUrl(accessToken).replace(/_/g, "%5F");
