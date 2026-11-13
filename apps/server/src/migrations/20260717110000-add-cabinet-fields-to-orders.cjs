"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Secret link token of the client cabinet (/my-order/<token>)
    await queryInterface.addColumn("Orders", "accessToken", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    // Page of the order in Notion → live status for the cabinet
    await queryInterface.addColumn("Orders", "notionPageId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    // When the "time to take measurements" reminder was sent (idempotency)
    await queryInterface.addColumn("Orders", "measurementsRequestedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("Orders", "measurementsRequestedAt");
    await queryInterface.removeColumn("Orders", "notionPageId");
    await queryInterface.removeColumn("Orders", "accessToken");
  },
};
