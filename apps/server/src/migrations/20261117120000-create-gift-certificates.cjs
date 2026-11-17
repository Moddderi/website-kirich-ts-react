"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("GiftCertificates", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      amountUah: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      buyerLabel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      purchaserFirstName: { type: Sequelize.STRING, allowNull: false },
      purchaserLastName: { type: Sequelize.STRING, allowNull: false },
      purchaserPhone: { type: Sequelize.STRING, allowNull: false },
      purchaserEmail: { type: Sequelize.STRING, allowNull: false },
      purchasedAt: { type: Sequelize.DATEONLY, allowNull: false },
      validUntil: { type: Sequelize.DATEONLY, allowNull: false },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      notionPageId: { type: Sequelize.STRING, allowNull: true },
      usedAt: { type: Sequelize.DATEONLY, allowNull: true },
      usedOrderId: { type: Sequelize.UUID, allowNull: true },
      communicationMethod: { type: Sequelize.STRING, allowNull: true },
      socialUsername: { type: Sequelize.STRING, allowNull: true },
      comment: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addColumn("Orders", "certificateCode", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Orders", "certificateDiscountUah", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Orders", "certificateDiscountUah");
    await queryInterface.removeColumn("Orders", "certificateCode");
    await queryInterface.dropTable("GiftCertificates");
  },
};