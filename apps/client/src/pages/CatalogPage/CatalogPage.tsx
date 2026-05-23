import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../api/productApi";
import { CatalogFilters } from "../../components/CatalogFilters/CatalogFilters";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import type { FilterInput, Product } from "@project/shared";

// 2. Импорт рантайм-объектов (твои Zod-схемы/энумы)
import {
  MainCategoryEnum,
  DanceProgramEnum,
  SubTypeEnum,
} from "@project/shared"; // Импортируем энумы для валидации типов
import { useDebounce } from "use-debounce";
import { useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";

const ProductSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-square bg-stone-200 rounded-2xl mb-4" />
    <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-stone-200 rounded w-1/2" />
  </div>
);

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Избавляемся от any при чтении из URL
  // Используем .safeParse или просто кастинг к типам из Zod
  const filters: FilterInput = {
    main_category: MainCategoryEnum.safeParse(searchParams.get("category"))
      .success
      ? (searchParams.get("category") as FilterInput["main_category"])
      : undefined,

    dance_program: DanceProgramEnum.safeParse(searchParams.get("program"))
      .success
      ? (searchParams.get("program") as FilterInput["dance_program"])
      : undefined,

    sub_type: SubTypeEnum.safeParse(searchParams.get("sub_type")).success
      ? (searchParams.get("sub_type") as FilterInput["sub_type"])
      : undefined,

    search: searchParams.get("search") || "",
  };

  // 2. Уточняем тип функции обновления
  const setFilters = (
    newFilters: FilterInput | ((prev: FilterInput) => FilterInput),
  ) => {
    const nextFilters =
      typeof newFilters === "function" ? newFilters(filters) : newFilters;

    const params = new URLSearchParams();

    if (nextFilters.main_category)
      params.set("category", nextFilters.main_category);
    if (nextFilters.dance_program)
      params.set("program", nextFilters.dance_program);
    if (nextFilters.sub_type) params.set("sub_type", nextFilters.sub_type);
    if (nextFilters.search?.trim()) params.set("search", nextFilters.search);

    setSearchParams(params);
  };

  const [debouncedFilters] = useDebounce(filters, 400);

  const {
    data: products = [],
    isLoading,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["products", debouncedFilters],
    queryFn: () => getProducts(debouncedFilters),
    placeholderData: (previousData) => previousData,
  });

  return (
    <main className="grow pb-32">
      <div className="flex justify-center"></div>

      <section className="mx-auto max-w-7xl px-6 lg:px-8 mt-12">
        <Breadcrumbs />
        <CatalogFilters filters={filters} setFilters={setFilters} />
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 transition-opacity duration-300 ${
            isPlaceholderData ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
        >
          {isLoading && !isPlaceholderData ? (
            [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
          ) : products.length > 0 ? (
            products.map((item: Product) => (
              <ProductCard key={item.product_code} product={item} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-stone-400">
              Товары не найдены
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
