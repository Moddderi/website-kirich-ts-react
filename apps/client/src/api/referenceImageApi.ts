import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"] as const;

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });

export const uploadOrderReferenceImage = async (file: File): Promise<string> => {
  if (!ACCEPT.includes(file.type as (typeof ACCEPT)[number])) {
    throw new Error("invalid_type");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("too_large");
  }

  const dataUrl = await readAsDataUrl(file);
  const { data } = await axios.post<{ success: boolean; url?: string; message?: string }>(
    `${API_URL}/orders/reference-image`,
    { dataUrl },
  );

  if (!data.success || !data.url) {
    throw new Error(data.message ?? "upload_failed");
  }
  return data.url;
};