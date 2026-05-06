"use strict";
const fs = require("fs");
const path = require("path");
require("dotenv").config();

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
    const folder = process.env.CLOUDINARY_FOLDER || "shop_products";
    const CLOUD_BASE_URL = `https://res.cloudinary.com/${cloudName}/image/upload/${folder}/`;

    const dataToInsert = products.map((product) => ({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      product_code: product.product_code,
      imageUrl: `${CLOUD_BASE_URL}${product.product_code}.jpg`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkDelete("Products", null, {});

    if (dataToInsert.length > 0) {
      await queryInterface.bulkInsert("Products", dataToInsert, {});
      console.log(`Успешно добавлено ${dataToInsert.length} товаров.`);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Products", null, {});
  },
};
