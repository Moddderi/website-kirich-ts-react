import db from "../models/index.js";
import { FilterInput } from "@project/shared";
import { Op } from "sequelize"; // Импортируем операторы для фильтрации

const { Product } = db;

export const getAllProducts = async (filters?: FilterInput) => {
  try {
    const where: any = {};

    if (filters) {
      // Фильтр по основной категории
      if (filters.main_category) {
        where.main_category = filters.main_category;
      }

      // Фильтр по подкатегории
      if (filters.sub_type) {
        where.sub_type = filters.sub_type;
      }

      // Поиск по названию (регистронезависимый iLike)
      if (filters.search) {
        where.name = { [Op.iLike]: `%${filters.search}%` };
      }

      // Фильтрация по диапазону цен
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined)
          where.price[Op.gte] = filters.minPrice;
        if (filters.maxPrice !== undefined)
          where.price[Op.lte] = filters.maxPrice;
      }
    }

    // Передаем объект where в запрос
    return await Product.findAll({ where });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Ошибка при получении списка с фильтрами:", error.message);
    }
    throw error;
  }
};

export const getProductById = async (id: number) => {
  try {
    const product = await Product.findByPk(id);
    return product;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Ошибка при получении продукта:", error.message);
    }
    throw error;
  }
};
