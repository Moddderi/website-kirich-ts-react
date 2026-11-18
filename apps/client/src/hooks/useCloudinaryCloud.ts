import { useQuery } from "@tanstack/react-query";
import { DEFAULT_CLOUDINARY_CLOUD } from "@project/shared";
import {
  fetchPublicConfig,
  publicConfigQueryKey,
} from "../api/publicConfigApi";

export const cloudinaryCloudQueryOptions = {
  queryKey: publicConfigQueryKey,
  queryFn: fetchPublicConfig,
  staleTime: 1000 * 60 * 60 * 24,
};

export const useCloudinaryCloud = (): string => {
  const { data } = useQuery(cloudinaryCloudQueryOptions);
  return data?.cloudinaryCloudName?.trim() || DEFAULT_CLOUDINARY_CLOUD;
};