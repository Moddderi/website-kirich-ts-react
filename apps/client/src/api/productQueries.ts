import type { QueryClient } from "@tanstack/react-query";
import type { Product, ProductsPage } from "@project/shared";
import { getProductById } from "./productApi";

const TEN_MINUTES = 1000 * 60 * 10;

/** Single source of truth so the product page and breadcrumbs share one request. */
export const productQueryKey = (id: string | number) =>
  ["productFull", String(id)] as const;

export const productQueryOptions = (id: string | number) => ({
  queryKey: productQueryKey(id),
  queryFn: () => getProductById(id) as Promise<Product>,
  staleTime: TEN_MINUTES,
});

/**
 * Looks for a product in already-loaded catalog pages so the product page can
 * render instantly while the full record is (re)validated in the background.
 */
export const findProductInListCache = (
  queryClient: QueryClient,
  id: string | number | undefined,
): Product | undefined => {
  if (id === undefined || id === "") return undefined;
  const target = String(id);

  for (const [, page] of queryClient.getQueriesData<ProductsPage>({
    queryKey: ["products"],
  })) {
    const hit = page?.items?.find(
      (p) => String(p.id) === target || p.product_code === target,
    );
    if (hit) return hit as Product;
  }
  return undefined;
};

export const prefetchProduct = (
  queryClient: QueryClient,
  id: string | number,
) => queryClient.prefetchQuery(productQueryOptions(id));
