/**
 * Marketing photos for the homepage (and the gift-certificate page hero).
 * Kept in `public/home/` so they are not mixed with Cloudinary shop product files.
 */
export const HOME_IMAGES = {
  heroLeft: "/home/hero-left.jpg",
  heroTopRight: "/home/hero-top-right.jpg",
  heroBottomRight: "/home/hero-bottom-right.jpg",
  bespoke: "/home/bespoke.jpg",
  ready: "/home/ready.jpg",
  giftCertificate: "/home/gift-certificate.jpg",
} as const;

export type HomeImageKey = keyof typeof HOME_IMAGES;
export type HomeImages = typeof HOME_IMAGES;
