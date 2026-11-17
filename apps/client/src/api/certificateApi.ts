import axios from "axios";
import type { GiftCertificatePurchase } from "@project/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

export type CertificateValidateResponse = {
  success: boolean;
  valid: boolean;
  number?: number;
  amountUah?: number;
  validUntil?: string;
  discountUah?: number;
  message?: string;
};

export const validateCertificate = async (
  code: string,
  orderTotalUah?: number,
) => {
  const { data } = await axios.get<CertificateValidateResponse>(
    `${API_URL}/certificates/validate/${encodeURIComponent(code)}`,
    {
      params:
        orderTotalUah != null ? { orderTotalUah: orderTotalUah } : undefined,
    },
  );
  return data;
};

export const purchaseGiftCertificate = async (
  payload: GiftCertificatePurchase,
) => {
  const { data } = await axios.post(`${API_URL}/certificates/purchase`, payload);
  return data as {
    success: boolean;
    certificate: {
      id: string;
      number: number;
      electronicCode: string;
      amountUah: number;
      validUntil: string;
      buyerLabel: string;
    };
    message?: string;
  };
};