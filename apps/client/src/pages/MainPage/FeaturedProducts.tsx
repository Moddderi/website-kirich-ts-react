import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { LuArrowRight } from "react-icons/lu";
import type { Product } from "@project/shared";
import { getProducts } from "../../api/productApi";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { Reveal } from "../../components/shared/Reveal/Reveal";

/** Ready-made showcase. Only rendered while CATALOG_ENABLED (see constants/features.ts). */
export default function FeaturedProducts() {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ["products", { page: 1, limit: 4, home: true }],
    queryFn: () => getProducts({ page: 1, limit: 4, search: "" }),
    staleTime: 1000 * 60 * 10,
  });

  const items = data?.items?.slice(0, 4) ?? [];

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
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
        <Link
          to="/catalog"
          className="group inline-flex items-center gap-2 self-start text-sm font-semibold text-stone-900 sm:self-auto"
        >
          <span className="border-b border-stone-900/30 pb-0.5 transition-colors group-hover:border-stone-900">
            {t("main.viewAll")}
          </span>
          <LuArrowRight
            size={18}
            strokeWidth={1.6}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </Reveal>

      <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {items.length > 0
          ? items.map((item: Product, index: number) => (
              <ProductCard
                key={item.product_code || item.id}
                product={item}
                imageLoading="lazy"
                enterDelayMs={index * 80}
              />
            ))
          : [...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="relative mb-4 aspect-3/4 overflow-hidden rounded-4xl bg-stone-200">
                  <div className="image-shimmer absolute inset-0" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-stone-200" />
                  <div className="h-4 w-1/2 rounded bg-stone-200" />
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
