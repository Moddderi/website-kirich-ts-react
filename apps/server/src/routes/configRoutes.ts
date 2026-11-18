import { Router } from "express";
import { DEFAULT_CLOUDINARY_CLOUD } from "@project/shared";

const router = Router();

/** Public site config (no secrets) — single source for client media URLs. */
router.get("/", (_req, res) => {
  res.json({
    cloudinaryCloudName:
      process.env.CLOUDINARY_CLOUD_NAME?.trim() || DEFAULT_CLOUDINARY_CLOUD,
  });
});

export default router;