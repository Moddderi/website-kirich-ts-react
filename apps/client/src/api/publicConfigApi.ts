import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

export type PublicConfig = {
  cloudinaryCloudName: string;
};

export const publicConfigQueryKey = ["publicConfig"] as const;

export const fetchPublicConfig = async (): Promise<PublicConfig> => {
  const { data } = await axios.get<PublicConfig>(`${API_URL}/config`);
  return data;
};