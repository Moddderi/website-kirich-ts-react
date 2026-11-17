import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@project/shared";
import { getProducts } from "../../api/productApi";
import { prefetchProduct } from "../../api/productQueries";
import { loadCartPage, loadProductPage } from "../../routes/lazyPages";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { CurrencySwitcher } from "../../components/CurrencySwitcher/CurrencySwitcher";
import { Reveal } from "../../components/shared/Reveal/Reveal";
import { HOME_ACCESSORY_CODES } from "../../constants/homeAccessories";

export default function FeaturedProducts() {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ["products", { home: "accessories" }],
    queryFn: () =>
      getProducts({ main_category: "accessories", page: 1, limit: 24, search: "" }),
    staleTime: 1000 * 60 * 10,
  });

  const byCode = new Map(
    (data?.items ?? []).map((item: Product) => [String(item.product_code), item]),
  );
  const items = HOME_ACCESSORY_CODES.map((code) => byCode.get(code)).filter(
    (item): item is Product => Boolean(item),
  );
  const queryClient = useQueryClient();
  const itemIds = items.map((item) => String(item.id || item.product_code)).join(",");

  useEffect(() => {
    if (!itemIds) return;
    void loadProductPage();
    void loadCartPage();
    for (const id of itemIds.split(",")) {
      void prefetchProduct(queryClient, id);
    }
  }, [itemIds, queryClient]);

  return (
    <section
      id="home-gifts"
      className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <Reveal className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-beige-600">
            {t("main.featuredKicker")}
          </p>
          <h2 className="font-display text-4xl font-medium tracking-tight text-stone-900 sm:text-5xl">
            {t("main.featuredTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-sm font-medium text-stone-500">
            {t("main.featuredSubtitle")}
          </p>
        </div>
        <div className="shrink-0 self-start sm:self-end">
          <CurrencySwitcher />
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {items.length > 0
          ? items.map((item: Product, index: number) => (
              <Reveal key={item.product_code || item.id} delay={index * 90}>
                <ProductCard
                  product={item}
                  imageLoading="eager"
                  fetchPriority={index < 2 ? "high" : "auto"}
                />
              </Reveal>
            ))
          : [...Array(4)].map((_, i) => (
              <Reveal key={i} delay={i * 90}>
                <div>
                  <div className="relative mb-4 aspect-3/4 overflow-hidden rounded-4xl bg-stone-200">
                    <div className="image-shimmer absolute inset-0" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-stone-200" />
                    <div className="h-4 w-1/2 rounded bg-stone-200" />
                  </div>
                </div>
              </Reveal>
            ))}
      </div>
    </section>
  );
}
