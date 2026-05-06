import express from "express";
// 1. Импортируем всё из контроллера как объект, чтобы обращение через точку работало
import * as productController from "../controllers/productController.js";
// 2. Добавляем недостающие схемы из shared
import { ProductSchema, IdParamSchema, FilterSchema } from "@project/shared";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Получение всех товаров с фильтрацией (поиск, цена и т.д.)
router.get(
  "/",
  validate(FilterSchema, "query"),
  productController.getAllProducts,
);

// Получение одного товара по ID
router.get(
  "/:id",
  validate(IdParamSchema, "params"),
  productController.getProductById,
);

export default router;
