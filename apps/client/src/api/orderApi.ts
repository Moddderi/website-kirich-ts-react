import axios from "axios";
import type { OrderPayload } from "@project/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

export const createOrder = async (orderPayload: OrderPayload) => {
  const { data } = await axios.post(`${API_URL}/orders`, orderPayload);
  return data;
};

export const getOrderById = async (orderId: string) => {
  const { data } = await axios.get(`${API_URL}/orders/${orderId}`);
  return data;
};
