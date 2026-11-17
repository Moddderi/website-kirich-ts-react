import { useEffect, useState } from "react";
import {
  isRedemptionCertificateCode,
  normalizeRedemptionCertificateCode,
} from "@project/shared";
import { validateCertificate } from "../api/certificateApi";

export const useCertificateDiscount = (
  code: string | undefined,
  orderTotalUah: number,
) => {
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [discountUah, setDiscountUah] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [amountUah, setAmountUah] = useState<number | null>(null);

  useEffect(() => {
    const trimmed = code?.trim();
    if (!trimmed || !isRedemptionCertificateCode(trimmed)) {
      setValid(false);
      setDiscountUah(0);
      setMessage(null);
      setAmountUah(null);
      return;
    }

    const normalized = normalizeRedemptionCertificateCode(trimmed);

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      void validateCertificate(normalized, orderTotalUah)
        .then((res) => {
          if (cancelled) return;
          if (res.valid && res.discountUah != null) {
            setValid(true);
            setDiscountUah(res.discountUah);
            setAmountUah(res.amountUah ?? null);
            setMessage(null);
          } else {
            setValid(false);
            setDiscountUah(0);
            setAmountUah(null);
            setMessage(res.message ?? "Сертифікат недійсний.");
          }
        })
        .catch(() => {
          if (cancelled) return;
          setValid(false);
          setDiscountUah(0);
          setMessage("Не вдалося перевірити сертифікат.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [code, orderTotalUah]);

  return { loading, valid, discountUah, message, amountUah };
};