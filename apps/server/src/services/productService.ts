import db from "../models/index.js";
import { FilterInput } from "@project/shared";
import { Op } from "sequelize"; // Импортируем операторы для фильтрации

const { Product, sequelize } = db;

export const getAllProducts = async (filters?: FilterInput) => {
  try {
    const where: any = {};

    if (filters) {
      // 1. Обычные фильтры (если они есть)
      if (filters.main_category) where.main_category = filters.main_category;
      if (filters.sub_type) where.sub_type = filters.sub_type;
      if (filters.dance_program) where.dance_program = filters.dance_program;

      // 2. Фильтр цен
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined)
          where.price[Op.gte] = filters.minPrice;
        if (filters.maxPrice !== undefined)
          where.price[Op.lte] = filters.maxPrice;
      }

      // 3. Поиск (добавляем через Op.and, чтобы он не затирал другие фильтры)
      if (filters?.search) {
        // Важно: переводим поисковый запрос в нижний кейс
        const s = filters.search.toLowerCase().trim();

        where[Op.and] = [
          {
            [Op.or]: [
              // Ищем по нормализованной колонке search_name
              { search_name: { [Op.like]: `%${s}%` } },
              { product_code: { [Op.like]: `%${s}%` } },
            ],
          },
        ];
      }
    }

    return await Product.findAll({ where });
  } catch (error) {
    console.error("Ошибка при получении списка:", error);
    throw error;
  }
};
