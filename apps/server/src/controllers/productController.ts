import * as productService from "../services/productService.js";
import { Request, Response } from "express";
import { FilterSchema } from "@project/shared"; // Путь к твоему shared пакету

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const filters = FilterSchema.parse(req.query);

    const products = await productService.getAllProducts(filters);

    return res.json(products);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(Number(id));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
