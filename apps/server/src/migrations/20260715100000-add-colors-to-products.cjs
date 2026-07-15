"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "colors", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      defaultValue: ["milky", "black", "red"],
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("Products", "colors");
  },
};
