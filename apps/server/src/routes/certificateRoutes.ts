import { Router } from "express";
import { giftCertificatePurchaseSchema } from "@project/shared";
import { validate } from "../middleware/validate.js";
import {
  purchaseCertificateController,
  validateCertificateController,
} from "../controllers/certificateController.js";

const router = Router();

router.post(
  "/purchase",
  validate(giftCertificatePurchaseSchema),
  purchaseCertificateController,
);

router.get("/validate/:code", validateCertificateController);

export default router;