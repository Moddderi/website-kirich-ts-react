import type { OrderPayload } from "@project/shared";
import db from "../models/index.js";
// 1. ИМПОРТИРУЕМ НАШУ УТИЛИТУ (проверь правильность пути к файлу!)
import { sendTelegramNotification } from "../utils/telegram.js";

export const createOrder = async (payload: OrderPayload) => {
  const transaction = await db.sequelize.transaction();
  try {
    const customMeasurements =
      payload.orderType === "custom" ? payload.measurements : null;

    // Создаем заказ в БД
    const order = await db.Order.create(
      {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        email: payload.email,
        deliveryMethod: payload.deliveryMethod,
        city:
          payload.deliveryMethod === "nova_poshta"
            ? (payload.city ?? null)
            : null,
        warehouse:
          payload.deliveryMethod === "nova_poshta"
            ? (payload.warehouse ?? null)
            : null,
        paymentMethod: payload.paymentMethod,
        totalAmount: payload.totalAmount,
        status: "pending",
        orderType: payload.orderType,
        communicationMethod: payload.communicationMethod,
        socialUsername: payload.socialUsername,
      },
      { transaction },
    );

    const orderItemsData = payload.items.map((item) => ({
      orderId: order.id,
      productId: item.productId ? Number(item.productId) : null,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      color: item.color || null,
      size: item.size || null,
      measurements: customMeasurements,
    }));

    await db.OrderItem.bulkCreate(orderItemsData, { transaction });

    await transaction.commit();

    //NOTE: Логика отправки тг сообщения

    try {
      const fullOrder = await getOrderById(order.id);

      if (fullOrder) {
        sendTelegramNotification(fullOrder);
      }
    } catch (tgError) {
      console.error("Помилка відправки в ТГ:", tgError);
    }

    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getOrders = async () => {
  return await db.Order.findAll({
    include: [{ model: db.OrderItem, as: "items" }],
    order: [["createdAt", "DESC"]],
  });
};

export const getOrderById = async (id: string) => {
  return await db.Order.findByPk(id, {
    include: [{ model: db.OrderItem, as: "items" }],
  });
};
