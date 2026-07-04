import { useTranslation } from "react-i18next";
import type { Product } from "@project/shared";

export function useProductName() {
  const { i18n } = useTranslation();

  return (product: Pick<Product, "name" | "name_en">) => {
    if (i18n.language === "en" && product.name_en) {
      return product.name_en;
    }
    return product.name;
  };
}
