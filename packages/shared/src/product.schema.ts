import { z } from "zod";

// 1. Определяем допустимые значения для категорий, чтобы избежать опечаток
export const MainCategoryEnum = z.enum(["clothing", "accessories"]);
export const SubTypeEnum = z.enum([
  "shirt",
  "t-shirt",
  "longsleeve",
  "pants",
  "tie",
  "belt",
  "socks",
  "service",
  "other",
]);

export const ProductSchema = z.object({
  name: z.string().min(2, "Название слишком короткое"),
  price: z.coerce.number().positive("Цена должна быть больше 0"),
  imageUrl: z.string().url("Некорректная ссылка").nullable().optional(),
  product_code: z.string().min(1, "Артикул обязателен"),
  // Добавляем новые поля
  main_category: MainCategoryEnum,
  sub_type: SubTypeEnum,
  stock: z.number().int().min(0).default(0),
});

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID должен быть положительным числом"),
});

// 3. Обновленная схема для фильтров
export const FilterSchema = z
  .object({
    main_category: MainCategoryEnum.optional(),
    sub_type: SubTypeEnum.optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    search: z.string().optional(),
  })
  .optional();

export type ProductInput = z.infer<typeof ProductSchema>;
export type IdParamInput = z.infer<typeof IdParamSchema>;
// Также полезно экспортировать тип фильтров для фронтенда
export type FilterInput = z.infer<typeof FilterSchema>;
