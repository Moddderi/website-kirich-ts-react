import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { CabinetOrder } from "@project/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

export const getCabinetOrder = async (token: string): Promise<CabinetOrder> => {
  const { data } = await axios.get<{ success: boolean; data: CabinetOrder }>(
    `${API_URL}/my-order/${encodeURIComponent(token)}`,
  );
  return data.data;
};

/** Order status for the client. No polling: it refreshes when the tab is focused again. */
export const useCabinetOrder = (token: string | undefined) =>
  useQuery({
    queryKey: ["cabinet", token],
    queryFn: () => getCabinetOrder(token as string),
    enabled: Boolean(token),
    retry: false,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

export interface SubmitMeasurementsPayload {
  unit: "cm" | "in";
  values: Record<string, string>;
}

export const submitCabinetMeasurements = async (
  token: string,
  payload: SubmitMeasurementsPayload,
): Promise<CabinetOrder> => {
  const { data } = await axios.post<{ success: boolean; data: CabinetOrder }>(
    `${API_URL}/my-order/${encodeURIComponent(token)}/measurements`,
    payload,
  );
  return data.data;
};

export interface CabinetOrderSummary {
  token: string;
  number: string;
  createdAt: string;
  garments: Array<{ type: string; program: string }>;
  start: string | null;
  readyTo: string | null;
}

/** Login step 1: send a 6-digit code to the e-mail (always "succeeds"). */
export const requestLoginCode = async (email: string): Promise<void> => {
  await axios.post(`${API_URL}/my-order/login/request`, { email });
};

/** Login step 2: exchange e-mail + code for a 90-day session token. */
export const verifyLoginCode = async (
  email: string,
  code: string,
): Promise<string> => {
  const { data } = await axios.post<{ success: boolean; token: string }>(
    `${API_URL}/my-order/login/verify`,
    { email, code },
  );
  return data.token;
};

export const getMyOrders = async (
  sessionToken: string,
): Promise<CabinetOrderSummary[]> => {
  const { data } = await axios.get<{ data: CabinetOrderSummary[] }>(
    `${API_URL}/my-order/session/orders`,
    { headers: { Authorization: `Bearer ${sessionToken}` } },
  );
  return data.data;
};
