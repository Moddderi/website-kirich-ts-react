import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { AvailabilityResponse, WorkDaysTable } from "@project/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

export interface AvailabilityParams {
  /** calendar days the order needs (fallback) */
  days: number;
  /** working days of production from the price list (preferred), or null */
  workDays: number | null;
}

export const getAvailability = async ({
  days,
  workDays,
}: AvailabilityParams): Promise<AvailabilityResponse> => {
  const { data } = await axios.get<AvailabilityResponse>(
    `${API_URL}/availability`,
    { params: { days, ...(workDays ? { workDays } : {}) } },
  );
  return data;
};

/** Studio calendar. Cached for 5 min on the client, 5 min on the server. */
export const useAvailability = (params: AvailabilityParams, enabled = true) =>
  useQuery({
    queryKey: ["availability", params.days, params.workDays],
    queryFn: () => getAvailability(params),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled,
  });

/** Production time (working days) per garment / ST-LAT from the Notion price list. */
export const useWorkDaysTable = () =>
  useQuery({
    queryKey: ["work-days"],
    queryFn: async (): Promise<WorkDaysTable | null> => {
      const { data } = await axios.get<{ table: WorkDaysTable | null }>(
        `${API_URL}/availability/work-days`,
      );
      return data.table;
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
