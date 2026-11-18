/** Product catalog images in Cloudinary (not order references / marketing uploads). */
export const CLOUDINARY_SHOP_PRODUCTS_FOLDER = "shop_products";

export const DEFAULT_CLOUDINARY_CLOUD = "dqe2odzsc";

export const shopProductImageCandidates = (productCode: string): string[] => {
  const code = productCode.trim();
  return [
    `${code}.jpg`,
    `${code}-1.jpg`,
    `${code}-2.jpg`,
    `${code}-3.jpg`,
  ];
};

/** Delivery URL without transforms (matches DB + seeders). */
export const buildShopProductImageUrl = (
  filename: string,
  cloudName: string = DEFAULT_CLOUDINARY_CLOUD,
): string =>
  `https://res.cloudinary.com/${cloudName}/image/upload/${CLOUDINARY_SHOP_PRODUCTS_FOLDER}/${filename}`;

export const buildShopProductDefaultImageUrl = (
  cloudName: string = DEFAULT_CLOUDINARY_CLOUD,
): string => buildShopProductImageUrl("default.jpg", cloudName);

/**
 * Rewrites legacy root URLs (`.../upload/3010.jpg`) → `.../upload/shop_products/3010.jpg`.
 * Leaves order-references, versioned URLs, and already-migrated paths unchanged.
 */
export const migrateShopImageUrl = (url: string): string => {
  if (!url.includes("res.cloudinary.com")) return url;
  const marker = "/image/upload/";
  const index = url.indexOf(marker);
  if (index < 0) return url;

  const tail = url.slice(index + marker.length);
  if (tail.startsWith(`${CLOUDINARY_SHOP_PRODUCTS_FOLDER}/`)) return url;

  const withoutVersion = tail.replace(/^v\d+\//, "");
  if (withoutVersion.includes("/")) return url;

  return `${url.slice(0, index + marker.length)}${CLOUDINARY_SHOP_PRODUCTS_FOLDER}/${withoutVersion}`;
};