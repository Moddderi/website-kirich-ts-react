"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Создаем таблицу Orders (Заказы)
    await queryInterface.createTable("Orders", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID, // ИСПРАВЛЕНО: INTEGER -> UUID
        defaultValue: Sequelize.UUIDV4, // База данных или Sequelize сами сгенерируют хэш
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deliveryMethod: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      warehouse: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      communicationMethod: {
        type: Sequelize.STRING,
        allowNull: true, // true, если клиент выберет обычный звонок по телефону
      },
      socialUsername: {
        type: Sequelize.STRING,
        allowNull: true, // true, если никнейм не заполнен
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 2. Создаем таблицу OrderItems (Товары в заказах)
    await queryInterface.createTable("OrderItems", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID, // ИСПРАВЛЕНО: INTEGER -> UUID (для консистентности)
        defaultValue: Sequelize.UUIDV4,
      },
      orderId: {
        type: Sequelize.UUID, // ИСПРАВЛЕНО: INTEGER -> UUID (чтобы тип совпадал с Orders.id)
        allowNull: false,
        references: {
          model: "Orders", // Связываем с таблицей Orders
          key: "id",
        },
        onDelete: "CASCADE", // При удалении заказа удалятся и его товары
        onUpdate: "CASCADE",
      },
      productId: {
        type: Sequelize.INTEGER, // Оставляем INTEGER, если у вас ID товаров числовые
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      size: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Метод down остается прежним (удаляем в обратном порядке)
    await queryInterface.dropTable("OrderItems");
    await queryInterface.dropTable("Orders");
  },
};
