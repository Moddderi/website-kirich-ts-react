"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Одиночный индекс для главной категории
    await queryInterface.addIndex("Products", ["main_category"], {
      name: "products_main_category_idx",
    });

    // 2. Одиночный индекс для программы танцев
    await queryInterface.addIndex("Products", ["dance_program"], {
      name: "products_dance_program_idx",
    });

    // 3. Одиночный индекс для подтипа товара
    await queryInterface.addIndex("Products", ["sub_type"], {
      name: "products_sub_type_idx",
    });

    // 4. Составной индекс для комбинации всех фильтров сразу
    await queryInterface.addIndex(
      "Products",
      ["main_category", "dance_program", "sub_type"],
      {
        name: "products_filters_composite_idx",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // В методе down удаляем индексы в случае отката (командой db:migrate:undo)
    await queryInterface.removeIndex("Products", "products_main_category_idx");
    await queryInterface.removeIndex("Products", "products_dance_program_idx");
    await queryInterface.removeIndex("Products", "products_sub_type_idx");
    await queryInterface.removeIndex(
      "Products",
      "products_filters_composite_idx",
    );
  },
};
