import db from "../models/index.js";
import { CATALOG_PAGE_SIZE, FilterInput } from "@project/shared";
import { Op } from "sequelize";

const { Product } = db;

const buildWhereClause = (filters?: FilterInput) => {
  const where: Record<string | symbol, unknown> = {};

  if (!filters) {
    return where;
  }

  if (filters.main_category) where.main_category = filters.main_category;
  if (filters.sub_type) where.sub_type = filters.sub_type;
  if (filters.dance_program) where.dance_program = filters.dance_program;

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      (where.price as Record<symbol, number>)[Op.gte] = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      (where.price as Record<symbol, number>)[Op.lte] = filters.maxPrice;
    }
  }

  if (filters.search) {
    const s = filters.search.toLowerCase().trim();

    where[Op.and] = [
      {
        [Op.or]: [
          { search_name: { [Op.like]: `%${s}%` } },
          { search_name_en: { [Op.like]: `%${s}%` } },
          { product_code: { [Op.like]: `%${s}%` } },
        ],
      },
    ];
  }

  return where;
};

export const getAllProducts = async (filters?: FilterInput) => {
  try {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? CATALOG_PAGE_SIZE;
    const offset = (page - 1) * limit;
    const where = buildWhereClause(filters);

    const { rows, count } = await Product.findAndCountAll({
      where,
      attributes: { exclude: ["search_name", "search_name_en"] },
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    return {
      items: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit) || 1,
    };
  } catch (error) {
    console.error("Ошибка при получении списка:", error);
    throw error;
  }
};

export const getProductById = async (id: string | number) => {
  try {
    // Используем встроенный метод Sequelize для поиска по Primary Key (ID)
    const product = await Product.findByPk(id);

    return product;
    // Если товар не найден, Sequelize вернет null.
    // Контроллер сам решит, отдавать ли 404 ошибку.
  } catch (error) {
    console.error(`Ошибка при получении товара по ID (${id}):`, error);
    throw error;
  }
};
