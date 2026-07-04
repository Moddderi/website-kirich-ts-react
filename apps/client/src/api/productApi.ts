import axios from "axios";
import type { FilterInput, ProductsPage } from "@project/shared";
import { CATALOG_PAGE_SIZE } from "@project/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

export const getProducts = async (filters?: FilterInput): Promise<ProductsPage> => {
  const cleanParams = Object.fromEntries(
    Object.entries(filters ?? {}).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined,
    ),
  );

  const { data } = await axios.get(`${API_URL}/products`, {
    params: cleanParams,
  });

  if (Array.isArray(data)) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? CATALOG_PAGE_SIZE;
    const offset = (page - 1) * limit;
    const items = data.slice(offset, offset + limit);

    return {
      items,
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit) || 1,
    };
  }

  return data as ProductsPage;
};

// Обязательно добавь export, чтобы ESLint понял, что она будет использоваться
// Обязательно добавь export, чтобы ESLint понял, что она будет использоваться
export const getProductById = async (id: string | number) => {
  const { data } = await axios.get(`${API_URL}/products/${id}`);
  return data;
};
