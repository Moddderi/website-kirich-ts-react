import type { Request, Response } from "express";
import {
  previewCertificateDiscount,
  purchaseGiftCertificate,
} from "../services/certificateService.js";

export const validateCertificateController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const code = String(req.params.code ?? "");
    const rawTotal = req.query.orderTotalUah;
    const orderTotalUah =
      rawTotal != null && rawTotal !== ""
        ? Number(rawTotal)
        : undefined;

    const preview = await previewCertificateDiscount(code, orderTotalUah);

    res.status(200).json({
      success: true,
      valid: true,
      ...preview,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Сертифікат недійсний.";
    res.status(200).json({
      success: true,
      valid: false,
      message,
    });
  }
};

export const purchaseCertificateController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cert = await purchaseGiftCertificate(req.body);
    res.status(201).json({
      success: true,
      message: "Сертифікат оформлено",
      certificate: cert,
    });
  } catch (error) {
    console.error("Помилка покупки сертифіката:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Внутрішня помилка сервера",
    });
  }
};