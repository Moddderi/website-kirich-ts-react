import axios from "axios";
import type { FilterInput } from "@project/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

export const getProducts = async (filters?: FilterInput) => {
  const cleanParams = Object.fromEntries(
    Object.entries(filters ?? {}).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined,
    ),
  );

  const { data } = await axios.get(`${API_URL}/products`, {
    params: cleanParams,
  });
  return data;
};
