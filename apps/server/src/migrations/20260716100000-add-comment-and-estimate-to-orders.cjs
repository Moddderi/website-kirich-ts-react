"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "comment", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    // Individual tailoring: price range, prepayment, planned start/ready dates
    await queryInterface.addColumn("Orders", "estimate", {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn("Orders", "estimate");
    await queryInterface.removeColumn("Orders", "comment");
  },
};
