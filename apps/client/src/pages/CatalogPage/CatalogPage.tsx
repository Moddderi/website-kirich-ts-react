import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../api/productApi";
import { CatalogFilters } from "../../components/CatalogFilters/CatalogFilters";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import type { FilterInput, Product } from "@project/shared";

import {
  CATALOG_PAGE_SIZE,
  MainCategoryEnum,
  DanceProgramEnum,
  SubTypeEnum,
} from "@project/shared";
import { useDebounce } from "use-debounce";
import { useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { CatalogLoadingBar } from "../../components/shared/CatalogLoadingBar/CatalogLoadingBar";
import { useCallback } from "react";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { useTranslation } from "react-i18next";

const ProductSkeleton = () => (
  <div>
    <div className="relative aspect-3/4 overflow-hidden rounded-4xl bg-stone-200 mb-4">
      <div className="image-shimmer absolute inset-0" />
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-stone-200 rounded w-3/4" />
      <div className="h-4 bg-stone-200 rounded w-1/2" />
    </div>
  </div>
);

export const CatalogPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

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
    page: currentPage,
    limit: CATALOG_PAGE_SIZE,
  };

  const [debouncedSearch] = useDebounce(filters.search, 400);

  const queryFilters: FilterInput = {
    ...filters,
    search: debouncedSearch,
    page: currentPage,
    limit: CATALOG_PAGE_SIZE,
  };

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

      params.set("page", "1");

      setSearchParams(params);
    },
    [filters, setSearchParams],
  );

  const {
    data,
    isLoading,
    isFetching,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["products", queryFilters],
    queryFn: () => getProducts(queryFilters),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });

  const displayedProducts = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="grow pb-32">
      <div className="flex justify-center"></div>

      <section className="mx-auto max-w-7xl px-6 lg:px-8 mt-12">
        <Breadcrumbs />

        <CatalogFilters filters={filters} setFilters={setFilters} />

        {isFetching && <CatalogLoadingBar />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {isLoading && !isPlaceholderData ? (
            [...Array(CATALOG_PAGE_SIZE)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))
          ) : isFetching && !isPlaceholderData ? (
            [...Array(CATALOG_PAGE_SIZE)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))
          ) : displayedProducts.length > 0 ? (
            displayedProducts.map((item: Product, index: number) => (
              <ProductCard
                key={item.product_code || item.id}
                product={item}
                imageLoading={index < 4 ? "eager" : "lazy"}
                enterDelayMs={index * 60}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-stone-400">
              {t("catalog.noProducts")}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-20 flex items-center justify-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isFetching}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-600 transition-all duration-300 hover:border-stone-900 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-xs"
            >
              <HiOutlineArrowLeft size={18} />
            </button>

            <span className="text-xs font-semibold tracking-widest uppercase text-stone-500">
              {t("catalog.page", { current: currentPage, total: totalPages })}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isFetching}
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
