export const SOCK_SIZES = ["35-38", "39-41", "41-44", "44-46"] as const;

export const NECKTIE_SIZE_IDS = ["child_40", "adult_55"] as const;

export type SockSize = (typeof SOCK_SIZES)[number];
export type NecktieSizeId = (typeof NECKTIE_SIZE_IDS)[number];

export const ACCESSORY_SIZE_LABELS_UK: Record<string, string> = {
  child_40: "дитяча (довжина 40 см)",
  adult_55: "доросла (довжина 55 см)",
};

export const ACCESSORY_SIZE_LABELS_EN: Record<string, string> = {
  child_40: "kids (length 40 cm)",
  adult_55: "adult (length 55 cm)",
};

type AccessoryLike = {
  sub_type?: string | null;
  name?: string | null;
  name_en?: string | null;
};

export const isBowTieProduct = (product: AccessoryLike): boolean => {
  const blob = `${product.name ?? ""} ${product.name_en ?? ""}`.toLowerCase();
  return /метелик|bow[\s-]?tie/.test(blob);
};

export const getAccessorySizes = (
  product: AccessoryLike,
): readonly string[] | null => {
  if (product.sub_type === "socks") return SOCK_SIZES;
  if (product.sub_type === "tie" && !isBowTieProduct(product)) {
    return NECKTIE_SIZE_IDS;
  }
  return null;
};

export const formatAccessorySize = (
  size: string | null | undefined,
  locale: "uk" | "en" = "uk",
): string => {
  if (!size) return "";
  const map = locale === "en" ? ACCESSORY_SIZE_LABELS_EN : ACCESSORY_SIZE_LABELS_UK;
  return map[size] ?? size;
};

export const isValidAccessorySize = (
  product: AccessoryLike,
  size: string | null | undefined,
): boolean => {
  const sizes = getAccessorySizes(product);
  if (!sizes) return !size;
  return typeof size === "string" && (sizes as readonly string[]).includes(size);
};
