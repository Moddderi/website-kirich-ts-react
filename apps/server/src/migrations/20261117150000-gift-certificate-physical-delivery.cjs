"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("GiftCertificates", "requestPhysicalDelivery", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("GiftCertificates", "deliveryMethod", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("GiftCertificates", "deliveryCity", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("GiftCertificates", "deliveryWarehouse", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("GiftCertificates", "deliveryWarehouse");
    await queryInterface.removeColumn("GiftCertificates", "deliveryCity");
    await queryInterface.removeColumn("GiftCertificates", "deliveryMethod");
    await queryInterface.removeColumn("GiftCertificates", "requestPhysicalDelivery");
  },
};