const CLOUD = "https://res.cloudinary.com/dqe2odzsc/image/upload";

/** Studio photos that already live in the Cloudinary root (same ones used by the catalog). */
export const HOME_IMAGES = {
  heroLeft: `${CLOUD}/3042-1.jpg`,
  heroTopRight: `${CLOUD}/3033.jpg`,
  heroBottomRight: `${CLOUD}/3080.jpg`,
  bespoke: `${CLOUD}/3081.jpg`,
  ready: `${CLOUD}/3013.jpg`,
  giftCertificate: `${CLOUD}/3082.jpg`,
} as const;
