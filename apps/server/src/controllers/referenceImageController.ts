import type { Request, Response } from "express";
import {
  isCloudinaryConfigured,
  uploadOrderReferenceImage,
} from "../utils/cloudinaryClient.js";

const MAX_BYTES = 5 * 1024 * 1024;
const DATA_URL_RE =
  /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/i;

export const uploadReferenceImageController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!isCloudinaryConfigured()) {
      res.status(503).json({
        success: false,
        message: "Завантаження фото тимчасово недоступне.",
      });
      return;
    }

    const dataUrl =
      typeof req.body?.dataUrl === "string" ? req.body.dataUrl.trim() : "";
    const match = DATA_URL_RE.exec(dataUrl);
    if (!match) {
      res.status(400).json({
        success: false,
        message: "Дозволені лише JPEG, PNG або WebP до 5 МБ.",
      });
      return;
    }

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length === 0 || buffer.length > MAX_BYTES) {
      res.status(400).json({
        success: false,
        message: "Файл порожній або перевищує 5 МБ.",
      });
      return;
    }

    const url = await uploadOrderReferenceImage(buffer);
    res.json({ success: true, url });
  } catch (error) {
    console.error("❌ reference-image upload:", error);
    res.status(500).json({
      success: false,
      message: "Не вдалося завантажити фото.",
    });
  }
};