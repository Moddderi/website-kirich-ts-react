import { Product } from "../models/product.js";

export const getAllProducts = async () => {
  try {
    return await Product.findAll({ order: [["id", "ASC"]] });
  } catch (error) {
    throw new Error(`Помилка БД: ${error.message}`);
  }
};

export const getProductById = async (id) => {
  return await Product.findByPk(id);
};
