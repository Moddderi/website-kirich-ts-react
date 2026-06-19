import db from "../models/index.js";
// 1. ИМПОРТИРУЕМ НАШУ УТИЛИТУ (проверь правильность пути к файлу!)
import { sendTelegramNotification } from "../utils/telegram.js";

interface OrderItemPayload {
  productId: number | null; // null для индивидуального пошива
  name: string;
  quantity: number;
  price: number;
  color?: string | null;
  size?: string | null;
  measurements?: object | null; // Новое поле для мерок
}

interface CreateOrderPayload {
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  delivery: { method: string; city: string; warehouse: string };
  payment: string;
  orderType: "ready-made" | "custom";
  communicationMethod: "telegram" | "instagram"; // Добавили
  socialUsername: string; // Добавили
  items: OrderItemPayload[];
  totalAmount: number;
}

export const createOrder = async (payload: CreateOrderPayload) => {
  const transaction = await db.sequelize.transaction();
  try {
    // Создаем заказ в БД
    const order = await db.Order.create(
      {
        firstName: payload.customer.firstName,
        lastName: payload.customer.lastName,
        phone: payload.customer.phone,
        email: payload.customer.email,
        deliveryMethod: payload.delivery.method,
        city:
          payload.delivery.method === "nova_poshta"
            ? payload.delivery.city
            : null,
        warehouse:
          payload.delivery.method === "nova_poshta"
            ? payload.delivery.warehouse
            : null,
        paymentMethod: payload.payment,
        totalAmount: payload.totalAmount,
        status: "pending",
        orderType: payload.orderType,
        communicationMethod: payload.communicationMethod, // Записываем метод связи
        socialUsername: payload.socialUsername, // Записываем ник
      },
      { transaction },
    );

    const orderItemsData = payload.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      color: item.color || null,
      size: item.size || null,
      measurements: item.measurements || null,
    }));

    await db.OrderItem.bulkCreate(orderItemsData, { transaction });

    await transaction.commit();

    //NOTE: Логика отправки тг сообщения

    // try {
    //   const fullOrder = await getOrderById(order.id);

    //   if (fullOrder) {
    //     sendTelegramNotification(fullOrder);
    //   }
    // } catch (tgError) {
    //   console.error("Помилка відправки в ТГ:", tgError);
    // }

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
