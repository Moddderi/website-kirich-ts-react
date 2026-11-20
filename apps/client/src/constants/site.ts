/** Public origin of the website. Override with `VITE_SITE_URL` only if the domain changes. */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://kirich-sewing-studio.com"
).replace(/\/+$/, "");

export const SITE_NAME = "K.I.RICH POLTAVA";

/** Absolute URL for Open Graph / Twitter shares. */
export const OG_IMAGE_URL = `${SITE_URL}/og.jpg?v=2`;
