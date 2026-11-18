"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("GiftCertificates", "accessToken", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("GiftCertificates", "giftShareToken", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("GiftCertificates", "giftShareToken");
    await queryInterface.removeColumn("GiftCertificates", "accessToken");
  },
};
