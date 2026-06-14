import { Request, Response } from "express";
// ИСПРАВЛЕНО: Добавили импорт функции getOrderById
import {
  createOrder,
  getOrders,
  getOrderById,
} from "../services/orderService.js";

export const createOrderController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const orderPayload = req.body;

    if (!orderPayload.items || orderPayload.items.length === 0) {
      res.status(400).json({ success: false, message: "Кошик порожній" });
      return;
    }

    const newOrder = await createOrder(orderPayload);

    res.status(201).json({
      success: true,
      message: "Замовлення успішно створено",
      orderId: newOrder.id,
    });
  } catch (error: any) {
    console.error("Помилка при створенні замовлення на бекенді:", error);
    res.status(500).json({
      success: false,
      message: "Внутрішня помилка сервера",
      error: error.message,
    });
  }
};

export const getOrdersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const orders = await getOrders();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("Помилка при отриманні замовлень на бекенді:", error);
    res.status(500).json({
      success: false,
      message: "Внутрішня помилка сервера",
      error: error.message,
    });
  }
};

// ИСПРАВЛЕНО: Добавили типизацию Express и убрали обращение к orderService
export const getOrderDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // Вызываем функцию напрямую, как и остальные сервисы
    const order = await getOrderById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Замовлення не знайдено",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Ошибка получения заказа:", error);
    res.status(500).json({
      success: false,
      message: "Внутрішня помилка сервера",
      error: error.message,
    });
  }
};
