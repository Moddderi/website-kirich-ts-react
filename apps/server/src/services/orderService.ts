import type { OrderPayload } from "@project/shared";
import db from "../models/index.js";
import { sendTelegramNotification } from "../utils/telegram.js";
import { sendOrderConfirmationEmail } from "../utils/email.js";

export const createOrder = async (payload: OrderPayload) => {
  if (!payload.items || !Array.isArray(payload.items)) {
    throw new Error(
      "Тіло замовлення не містить масиву товарів (items) або він пустий.",
    );
  }

  const transaction = await db.sequelize.transaction();
  try {
    const customMeasurements =
      payload.orderType === "custom" ? payload.measurements : null;

    const order = await db.Order.create(
      {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        email: payload.email,
        deliveryMethod: payload.deliveryMethod,
        city:
          payload.deliveryMethod === "nova_poshta" ||
          payload.deliveryMethod === "ukrposhta"
            ? (payload.city ?? null)
            : null,
        warehouse:
          payload.deliveryMethod === "nova_poshta" ||
          payload.deliveryMethod === "ukrposhta"
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

    try {
      const fullOrder = await getOrderById(order.id);

      if (fullOrder) {
        const orderForNotifications = {
          ...fullOrder.toJSON(),
          displayCurrency: payload.displayCurrency ?? "UAH",
        };

        // Менеджеру в Telegram
        void sendTelegramNotification(orderForNotifications);

        // Клієнту на email (Resend)
        void sendOrderConfirmationEmail(orderForNotifications);
      }
    } catch (notifyError) {
      console.error("Помилка відправки сповіщень:", notifyError);
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
