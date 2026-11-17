import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@project/shared";
import { convertCartTotalFromUah } from "@project/shared";
import { getProducts } from "../api/productApi";
import { HOME_ACCESSORY_CODES } from "../constants/homeAccessories";
import { useAppSelector } from "../store/store";

export const useReadyAccessories = () => {
  const lines = useAppSelector((state) => state.tailoring.readyAccessories);
  const currency = useAppSelector((state) => state.currency.code);

  const { data, isLoading } = useQuery({
    queryKey: ["products", { home: "accessories" }],
    queryFn: () =>
      getProducts({ main_category: "accessories", page: 1, limit: 24, search: "" }),
    staleTime: 1000 * 60 * 10,
  });

  const products = useMemo(() => {
    const byCode = new Map(
      (data?.items ?? []).map((item: Product) => [String(item.product_code), item]),
    );
    return HOME_ACCESSORY_CODES.map((code) => byCode.get(code)).filter(
      (item): item is Product => Boolean(item),
    );
  }, [data]);

  const selected = useMemo(
    () =>
      lines.flatMap((line) => {
        const product = products.find((item) => String(item.id) === line.productId);
        if (!product) return [];
        return [
          {
            productId: line.productId,
            quantity: line.quantity,
            product,
            priceUah: Number(product.price),
          },
        ];
      }),
    [lines, products],
  );

  const totalDisplay = convertCartTotalFromUah(
    selected.map((line) => ({ price: line.priceUah, quantity: line.quantity })),
    currency,
  );

  return { products, selected, totalDisplay, isLoading, currency };
};
