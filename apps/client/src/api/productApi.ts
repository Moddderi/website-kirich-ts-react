import axios from "axios";
import type { FilterInput } from "@project/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getProducts = async (filters: FilterInput) => {
  // Axios автоматически превратит объект filters в строку ?main_category=...&minPrice=...
  const { data } = await axios.get(`${API_URL}/products`, { params: filters });
  return data;
};
