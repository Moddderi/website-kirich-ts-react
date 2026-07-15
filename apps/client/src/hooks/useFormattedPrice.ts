import { useCallback, useMemo } from "react";
import { useAppSelector } from "../store/store";
import {
  convertCartTotalFromUah,
  convertFromUah,
  convertLineFromUah,
  formatConvertedPrice,
  formatPrice,
} from "../utils/currency";

export const useFormattedPrice = () => {
  const currency = useAppSelector((state) => state.currency.code);

  return useCallback(
    (amountUah: number) => formatPrice(amountUah, currency),
    [currency],
  );
};

/** Converts unit UAH → display currency once, then * quantity. Safe for cart totals. */
export const useCartMoney = () => {
  const currency = useAppSelector((state) => state.currency.code);

  return useMemo(
    () => ({
      currency,
      formatLine: (unitPriceUah: number, quantity: number) =>
        formatConvertedPrice(
          convertLineFromUah(unitPriceUah, quantity, currency),
          currency,
        ),
      formatTotal: (
        items: Array<{ price: number; quantity: number }>,
      ) =>
        formatConvertedPrice(
          convertCartTotalFromUah(items, currency),
          currency,
        ),
      unitPrice: (unitPriceUah: number) =>
        convertFromUah(unitPriceUah, currency),
    }),
    [currency],
  );
};
