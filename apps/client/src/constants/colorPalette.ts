export type PaletteColor = {
  id: string;
  hex: string;
};

/** Standard selectable colors on product page */
export const PRODUCT_COLORS: PaletteColor[] = [
  { id: "milky", hex: "#F5F0E6" },
  { id: "black", hex: "#111111" },
  { id: "red", hex: "#C41E3A" },
];

/**
 * Full studio fabric palette for the palette modal.
 * Order roughly follows the physical fabric swatch card.
 */
export const FULL_COLOR_PALETTE: PaletteColor[] = [
  // Row 1
  { id: "taupe", hex: "#8B7355" },
  { id: "dustyPink", hex: "#D4A5A5" },
  { id: "milky", hex: "#F5F0E6" },
  { id: "forest", hex: "#1B3A2F" },
  // Row 2
  { id: "burgundy", hex: "#6B0F1A" },
  { id: "red", hex: "#C41E3A" },
  { id: "tomato", hex: "#D94F3D" },
  { id: "mauve", hex: "#9A7B8F" },
  // Row 3
  { id: "black", hex: "#111111" },
  { id: "silver", hex: "#C8C8C8" },
  { id: "sage", hex: "#9CAF88" },
  { id: "navy", hex: "#1B2A4A" },
  // Row 4
  { id: "sky", hex: "#7EB6D9" },
  { id: "teal", hex: "#1F5C5C" },
  { id: "sand", hex: "#C2B280" },
  { id: "butter", hex: "#F0E68C" },
  // Row 5
  { id: "olive", hex: "#6B6B3D" },
  { id: "seafoam", hex: "#8FBC8F" },
  { id: "heather", hex: "#A8A8A8" },
  { id: "charcoal", hex: "#4A4A4A" },
  // Row 6
  { id: "graphite", hex: "#2F2F2F" },
  { id: "mustard", hex: "#C4A035" },
  { id: "peach", hex: "#E8B896" },
  { id: "white", hex: "#FFFFFF" },
  // Row 7
  { id: "slateBlue", hex: "#6A7F9A" },
  { id: "fuchsia", hex: "#C71585" },
  { id: "dove", hex: "#D3D3D3" },
  { id: "kelly", hex: "#2E8B57" },
  // Row 8
  { id: "royal", hex: "#2E5090" },
  { id: "chocolate", hex: "#3D2314" },
  { id: "walnut", hex: "#6F4E37" },
  { id: "steel", hex: "#555555" },
  // Row 9
  { id: "tan", hex: "#D2B48C" },
  { id: "lilac", hex: "#C8B6D9" },
  { id: "lemon", hex: "#F4D03F" },
  { id: "terracotta", hex: "#A0522D" },
  // Row 10
  { id: "cocoa", hex: "#5C4033" },
  { id: "beige", hex: "#D4C4A8" },
  { id: "cornflower", hex: "#6495ED" },
  { id: "umber", hex: "#4A3728" },
  // Row 11
  { id: "blueGrey", hex: "#6B7B8A" },
  { id: "darkCharcoal", hex: "#2C2C2C" },
  { id: "earth", hex: "#3B2F2F" },
];

const ALL_COLORS: PaletteColor[] = [
  ...PRODUCT_COLORS,
  ...FULL_COLOR_PALETTE.filter(
    (c) => !PRODUCT_COLORS.some((p) => p.id === c.id),
  ),
];

export const getColorById = (id: string): PaletteColor | undefined =>
  ALL_COLORS.find((c) => c.id === id);

export const resolveProductColors = (
  colorIds: string[] | null | undefined,
): PaletteColor[] => {
  if (!colorIds?.length) return [];
  return colorIds
    .map((id) => getColorById(id))
    .filter((c): c is PaletteColor => Boolean(c));
};
