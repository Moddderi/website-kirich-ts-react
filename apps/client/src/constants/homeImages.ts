const CLOUD = "https://res.cloudinary.com/dqe2odzsc/image/upload";

/** Studio photos that already live in the Cloudinary root (same ones used by the catalog). */
export const HOME_IMAGES = {
  heroLeft: `${CLOUD}/3042-1.jpg`,
  heroTopRight: `${CLOUD}/3033.jpg`,
  heroBottomRight: `${CLOUD}/3040-1.jpg`,
  bespoke: `${CLOUD}/3042-2.jpg`,
  ready: `${CLOUD}/3013.jpg`,
} as const;
