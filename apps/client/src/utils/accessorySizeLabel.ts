import { formatAccessorySize } from "@project/shared";

export const accessorySizeLabel = (
  size: string | null | undefined,
  t: (key: string, options?: { defaultValue?: string }) => string,
): string => {
  if (!size) return "";
  return t(`productPage.accessorySizes.${size}`, {
    defaultValue: formatAccessorySize(size, "uk") || size,
  });
};
