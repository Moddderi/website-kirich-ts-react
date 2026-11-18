import { useMemo } from "react";
import { buildShopProductImageUrl } from "@project/shared";
import { useCloudinaryCloud } from "../hooks/useCloudinaryCloud";

const HOME_IMAGE_FILES = {
  heroLeft: "3083.jpg",
  heroTopRight: "3084.jpg",
  heroBottomRight: "3080.jpg",
  bespoke: "3081.jpg",
  ready: "3013.jpg",
  giftCertificate: "3082.jpg",
} as const;

export type HomeImageKey = keyof typeof HOME_IMAGE_FILES;
export type HomeImages = Record<HomeImageKey, string>;

export const buildHomeImages = (cloudName: string): HomeImages => {
  const img = (filename: string) =>
    buildShopProductImageUrl(filename, cloudName);
  return {
    heroLeft: img(HOME_IMAGE_FILES.heroLeft),
    heroTopRight: img(HOME_IMAGE_FILES.heroTopRight),
    heroBottomRight: img(HOME_IMAGE_FILES.heroBottomRight),
    bespoke: img(HOME_IMAGE_FILES.bespoke),
    ready: img(HOME_IMAGE_FILES.ready),
    giftCertificate: img(HOME_IMAGE_FILES.giftCertificate),
  };
};

export const useHomeImages = (): HomeImages => {
  const cloud = useCloudinaryCloud();
  return useMemo(() => buildHomeImages(cloud), [cloud]);
};