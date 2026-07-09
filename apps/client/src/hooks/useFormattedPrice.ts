import { useCallback } from "react";
import { useAppSelector } from "../store/store";
import { formatPrice } from "../utils/currency";

export const useFormattedPrice = () => {
  const currency = useAppSelector((state) => state.currency.code);

  return useCallback(
    (amountUah: number) => formatPrice(amountUah, currency),
    [currency],
  );
};
