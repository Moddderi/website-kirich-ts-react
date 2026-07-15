import { z } from "zod";

// 1. Определяем допустимые значения для категорий, чтобы избежать опечаток
export const MainCategoryEnum = z.enum(["clothing", "accessories"]);
export const DanceProgramEnum = z.enum(["ST", "LAT"]);
export const SubTypeEnum = z.enum([
  "shirt",
  "t-shirt",
  "longsleeve",
  "pants",
  "tie",
  "belt",
  "socks",
  "other",
]);

export const SUBTYPE_MAP = {
  ST: ["shirt", "pants", "t-shirt"],
  LAT: ["shirt", "pants", "t-shirt", "longsleeve"],
  accessories: ["tie", "belt", "socks", "other"],
} as const;

export const SUBTYPE_LABELS: Record<string, string> = {
  shirt: "Сорочки",
  pants: "Штани",
  "t-shirt": "Футболки",
  longsleeve: "Лонгсліви",
  tie: "Краватки",
  belt: "Ремені",
  socks: "Шкарпетки",
  other: "Інше",
};

export const ProductSchema = z.object({
  name: z.string().min(2),
  name_en: z.string().nullish(),
  price: z.coerce.number().positive(),
  imageUrl: z.array(z.string().url()).default([]),
  product_code: z.string().min(1),
  main_category: MainCategoryEnum,
  sub_type: SubTypeEnum,
  stock: z.number().int().min(0).default(0),
  dance_program: DanceProgramEnum.nullable().optional(),
  colors: z.array(z.string().min(1)).default([]),
});

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID должен быть положительным числом"),
});

export const CATALOG_PAGE_SIZE = 8;

// 3. Обновленная схема для фильтров
export const FilterSchema = z.object({
  main_category: MainCategoryEnum.optional(),
  sub_type: SubTypeEnum.optional(),
  dance_program: DanceProgramEnum.optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim()),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(24).optional(),
});

export const ProductsPageSchema = z.object({
  items: z.array(ProductSchema.extend({ id: z.number() })),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ProductInput = z.infer<typeof ProductSchema>;
export type IdParamInput = z.infer<typeof IdParamSchema>;
export type FilterInput = z.infer<typeof FilterSchema>;
export type ProductsPage = z.infer<typeof ProductsPageSchema>;

export type Product = ProductInput & { id: number };
