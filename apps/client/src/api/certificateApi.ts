import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type {
  CabinetCertificate,
  GiftCertificatePurchase,
  PublicGiftCertificate,
} from "@project/shared";

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
      accessToken: string;
      giftShareToken: string;
    };
    message?: string;
  };
};

export const getCabinetCertificate = async (
  token: string,
): Promise<CabinetCertificate> => {
  const { data } = await axios.get<{ success: boolean; data: CabinetCertificate }>(
    `${API_URL}/certificates/cabinet/${encodeURIComponent(token)}`,
    { timeout: 20_000 },
  );
  return data.data;
};

export const useCabinetCertificate = (token: string | undefined) =>
  useQuery({
    queryKey: ["cabinet-certificate", token],
    queryFn: () => getCabinetCertificate(token as string),
    enabled: Boolean(token),
    retry: false,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

export const getPublicGiftCertificate = async (
  shareToken: string,
): Promise<PublicGiftCertificate> => {
  const { data } = await axios.get<{
    success: boolean;
    data: PublicGiftCertificate;
  }>(`${API_URL}/certificates/gift/${encodeURIComponent(shareToken)}`, {
    timeout: 20_000,
  });
  return data.data;
};

export const usePublicGiftCertificate = (shareToken: string | undefined) =>
  useQuery({
    queryKey: ["gift-share", shareToken],
    queryFn: () => getPublicGiftCertificate(shareToken as string),
    enabled: Boolean(shareToken),
    retry: false,
    staleTime: 1000 * 60 * 2,
  });