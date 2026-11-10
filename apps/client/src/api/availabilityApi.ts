import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { AvailabilityResponse } from "@project/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

export const getAvailability = async (
  days = 1,
): Promise<AvailabilityResponse> => {
  const { data } = await axios.get<AvailabilityResponse>(
    `${API_URL}/availability`,
    { params: { days } },
  );
  return data;
};

/** Studio calendar. Cached for 5 min on the client, 5 min on the server. */
export const useAvailability = (days = 1) =>
  useQuery({
    queryKey: ["availability", days],
    queryFn: () => getAvailability(days),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
