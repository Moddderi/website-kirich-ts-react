import { Router } from "express";
import { giftCertificatePurchaseSchema } from "@project/shared";
import { validate } from "../middleware/validate.js";
import {
  getCabinetCertificateController,
  getPublicGiftCertificateController,
  purchaseCertificateController,
  validateCertificateController,
} from "../controllers/certificateController.js";

const router = Router();

router.post(
  "/purchase",
  validate(giftCertificatePurchaseSchema),
  purchaseCertificateController,
);

router.get("/cabinet/:token", getCabinetCertificateController);
router.get("/gift/:shareToken", getPublicGiftCertificateController);
router.get("/validate/:code", validateCertificateController);

export default router;