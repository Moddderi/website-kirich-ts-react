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

export const requestCabinetLink = async (email: string): Promise<void> => {
  await axios.post(`${API_URL}/my-order/request-link`, { email });
};
