// 1. Фикс ошибки 7016: Импортируем из index, где собраны все модели
// Мы используем путь к index.js (TS сам поймет, что нужно брать .ts исходник)
import db from "../models/index.js";

// Извлекаем модель из объекта db
const { Product } = db;

export const getProductById = async (id: number) => {
  // 2. Фикс ошибки 7006: добавили тип :number
  try {
    const product = await Product.findByPk(id);
    return product;
  } catch (error: unknown) {
    // 3. Фикс ошибки 18046: обрабатываем unknown
    if (error instanceof Error) {
      console.error("Ошибка при получении продукта:", error.message);
    }
    throw error;
  }
};

export const getAllProducts = async () => {
  try {
    return await Product.findAll();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Ошибка при получении списка:", error.message);
    }
    throw error;
  }
};
