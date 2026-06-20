import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../api/productApi";
import { CatalogFilters } from "../../components/CatalogFilters/CatalogFilters";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import type { FilterInput, Product } from "@project/shared";

import {
  MainCategoryEnum,
  DanceProgramEnum,
  SubTypeEnum,
} from "@project/shared";
import { useDebounce } from "use-debounce";
import { useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { useCallback } from "react";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";

const ProductSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-stone-200 rounded-4xl mb-4" />
    <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-stone-200 rounded w-1/2" />
  </div>
);

// Количество товаров на страницу для пагинации (можно вынести в константы)
const ITEMS_PER_PAGE = 12;

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Чтение параметров из URL с дефолтными значениями для пагинации
  const currentPage = Number(searchParams.get("page")) || 1;

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

  // Применяем дебаунс только к строке поиска, чтобы не дергать API при каждом нажатии,
  // а фильтры по категориям применялись мгновенно.
  const [debouncedSearch] = useDebounce(filters.search, 400);

  // Формируем объединенный объект фильтров для запроса
  const queryFilters = {
    ...filters,
    search: debouncedSearch,
    // В зависимости от вашей API, сюда же можно прокинуть page или limit, например:
    // page: currentPage,
    // limit: ITEMS_PER_PAGE,
  };

  // Оптимизируем функцию обновления параметров, чтобы сбрасывать страницу на 1
  // при изменении фильтров или поиска, предотвращая пустые выдачи.
  const setFilters = useCallback(
    (newFilters: FilterInput | ((prev: FilterInput) => FilterInput)) => {
      const nextFilters =
        typeof newFilters === "function" ? newFilters(filters) : newFilters;

      const params = new URLSearchParams();

      if (nextFilters.main_category)
        params.set("category", nextFilters.main_category);
      if (nextFilters.dance_program)
        params.set("program", nextFilters.dance_program);
      if (nextFilters.sub_type) params.set("sub_type", nextFilters.sub_type);
      if (nextFilters.search?.trim()) params.set("search", nextFilters.search);

      // Возвращаем на 1-ю страницу при смене фильтров
      params.set("page", "1");

      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Используем React Query для кэширования.
  // staleTime — время, в течение которого данные считаются свежими (10 минут),
  // запросы за это время не будут отправляться повторно при монтировании.
  const {
    data: products = [],
    isLoading,
    isFetching,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["products", queryFilters],
    queryFn: () => getProducts(queryFilters),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15, // Время жизни кэша (ранее cacheTime)
  });

  // Функция переключения страниц
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Логика пагинации (если бэкенд отдает массив, делим его на фронте. В идеале это делает бэк).
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const displayedProducts = Array.isArray(products)
    ? products.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];

  return (
    <main className="grow pb-32">
      <div className="flex justify-center"></div>

      <section className="mx-auto max-w-7xl px-6 lg:px-8 mt-12">
        <Breadcrumbs />

        {/* Передаем функцию для фильтрации */}
        <CatalogFilters filters={filters} setFilters={setFilters} />

        {/* Сетка товаров */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 transition-all duration-300 ${
            isPlaceholderData || isFetching
              ? "opacity-60 pointer-events-none"
              : "opacity-100"
          }`}
        >
          {isLoading && !isPlaceholderData ? (
            [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
          ) : displayedProducts.length > 0 ? (
            displayedProducts.map((item: Product) => (
              <ProductCard key={item.product_code || item.id} product={item} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-stone-400">
              Товары не найдены
            </div>
          )}
        </div>

        {/* ПАГИНАЦИЯ (Постраничный переключатель) */}
        {products.length > ITEMS_PER_PAGE && (
          <div className="mt-20 flex items-center justify-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-600 transition-all duration-300 hover:border-stone-900 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-xs"
            >
              <HiOutlineArrowLeft size={18} />
            </button>

            <span className="text-xs font-semibold tracking-widest uppercase text-stone-500">
              Сторінка {currentPage} з {totalPages || 1}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={
                currentPage === totalPages ||
                displayedProducts.length < ITEMS_PER_PAGE
              }
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-600 transition-all duration-300 hover:border-stone-900 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-xs"
            >
              <HiOutlineArrowRight size={18} />
            </button>
          </div>
        )}
      </section>
    </main>
  );
};
