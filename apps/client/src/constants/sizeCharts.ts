export type SizeGroup = "men" | "kids";

export type SizeChartRow = {
  size: string;
  chest: string;
  waist: string;
  hips: string;
};

export const MEN_SIZE_CHART: SizeChartRow[] = [
  { size: "XS", chest: "88", waist: "74", hips: "90" },
  { size: "S", chest: "92", waist: "78", hips: "94" },
  { size: "M", chest: "96", waist: "82", hips: "98" },
  { size: "L", chest: "100", waist: "86", hips: "102" },
  { size: "XL", chest: "108", waist: "94", hips: "110" },
  { size: "XXL", chest: "112", waist: "98", hips: "114" },
];

export const KIDS_SIZE_CHART: SizeChartRow[] = [
  { size: "110", chest: "56", waist: "55", hips: "62" },
  { size: "116", chest: "60", waist: "58", hips: "64" },
  { size: "122", chest: "62", waist: "59", hips: "66" },
  { size: "128", chest: "64", waist: "60", hips: "68" },
  { size: "134", chest: "68", waist: "62", hips: "72" },
  { size: "140", chest: "70", waist: "63", hips: "74" },
  { size: "146", chest: "72", waist: "64", hips: "76" },
  { size: "152", chest: "76", waist: "66", hips: "80" },
  { size: "158", chest: "80", waist: "68", hips: "84" },
  { size: "164", chest: "84", waist: "70", hips: "86" },
];

export const MEN_SIZES = MEN_SIZE_CHART.map((row) => row.size);
export const KIDS_SIZES = KIDS_SIZE_CHART.map((row) => row.size);

export const getSizeGroup = (size: string): SizeGroup =>
  KIDS_SIZES.includes(size) ? "kids" : "men";

export const getSizesForGroup = (group: SizeGroup): string[] =>
  group === "men" ? MEN_SIZES : KIDS_SIZES;
