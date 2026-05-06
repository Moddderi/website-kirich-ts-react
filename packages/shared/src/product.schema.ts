import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2, "Название слишком короткое"),
  price: z.coerce.number().positive("Цена должна быть больше 0"),
  imageUrl: z.string().url("Некорректная ссылка").nullable(),
  product_code: z.string().min(1, "Артикул обязателен"),
});

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID должен быть положительным числом"),
});

// 3. Схема для фильтров (query параметры в GET /)
// Сделаем все поля необязательными (.optional()), так как фильтры могут и не прислать
export const FilterSchema = z
  .object({
    category: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    search: z.string().optional(),
  })
  .optional();

export type ProductInput = z.infer<typeof ProductSchema>;
export type IdParamInput = z.infer<typeof IdParamSchema>;
