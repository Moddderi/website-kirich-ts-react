"use strict";
const fs = require("fs");
const path = require("path");
const https = require("https");
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Хелпер для быстрой HEAD-проверки существования картинки
function checkImageExists(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD" }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.end();
  });
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const jsonPath = path.resolve(__dirname, "../../products.json");

    if (!fs.existsSync(jsonPath)) {
      console.error(`Ошибка: Файл не найден по пути ${jsonPath}`);
      return;
    }

    const products = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dqe2odzsc";

    // Формируем базовый URL прямо в корень upload, БЕЗ подпапок, как в твоем примере
    const CLOUD_BASE_URL = `https://res.cloudinary.com/${cloudName}/image/upload/`;
    const DEFAULT_IMAGE = `${CLOUD_BASE_URL}default.jpg`;

    console.log("\n=== 🔍 НАЧИНАЕМ СКАНИРОВАНИЕ КОРНЯ CLOUDINARY ===");

    const dataToInsert = await Promise.all(
      products.map(async (product) => {
        const foundUrls = [];
        const code = product.product_code;

        // Варианты названий файлов (основная и доп. фото)
        const candidates = [
          `${code}.jpg`,
          `${code}-1.jpg`,
          `${code}-2.jpg`,
          `${code}-3.jpg`,
        ];

        for (const filename of candidates) {
          const url = `${CLOUD_BASE_URL}${filename}`;
          const exists = await checkImageExists(url);

          if (exists) {
            foundUrls.push(url);
          }
        }

        // Вывод результатов проверки в реальном времени
        if (foundUrls.length > 0) {
          console.log(
            `✅ Товар [${code}]: Найдено фото -> ${foundUrls.length} шт.`,
          );
        } else {
          console.log(
            `⚠️ Товар [${code}]: Фото не найдено. Назначен default.jpg`,
          );
          foundUrls.push(DEFAULT_IMAGE);
        }

        return {
          name: product.name,
          name_en: product.name_en || null,
          search_name: product.search_name,
          search_name_en: product.search_name_en || null,
          price: product.price,
          product_code: code,
          main_category: product.main_category,
          dance_program: product.dance_program,
          sub_type: product.sub_type,
          stock: product.stock || 0,
          colors:
            Array.isArray(product.colors) && product.colors.length > 0
              ? product.colors
              : Sequelize.literal("ARRAY[]::VARCHAR[]"),
          imageUrl: foundUrls,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }),
    );

    console.log("=== 🏁 СКАН ЗАВЕРШЕН. ОЧИСТКА И ЗАПИСЬ В БАЗУ ДАННЫХ ===\n");

    // Очищаем таблицу перед импортом
    await queryInterface.bulkDelete("Products", null, {});

    if (dataToInsert.length > 0) {
      await queryInterface.bulkInsert("Products", dataToInsert, {});
      console.log(
        `🚀 Успех! База Neon обновлена. Залито ${dataToInsert.length} товаров.`,
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Products", null, {});
  },
};
