import { z } from "zod";

export const MeasurementUnitEnum = z.enum(["cm", "in"]);
export type MeasurementUnit = z.infer<typeof MeasurementUnitEnum>;

export const MEASUREMENT_UNIT_LABELS: Record<MeasurementUnit, string> = {
  cm: "см",
  in: "дюйми",
};

export const customMeasurementsSchema = z.object({
  unit: MeasurementUnitEnum,
  values: z.record(z.string(), z.string()),
});

export type CustomMeasurements = z.infer<typeof customMeasurementsSchema>;

const createRequiredMeasurementField = (unit: MeasurementUnit) =>
  z
    .string()
    .min(1, "Обов'язкове поле")
    .refine((value) => {
      const parsed = Number(value);
      if (Number.isNaN(parsed) || parsed <= 0) return false;
      return parsed <= (unit === "cm" ? 400 : 160);
    }, unit === "cm"
      ? "Вкажіть значення від 1 до 400 см"
      : "Вкажіть значення від 1 до 160 дюймів");

const createHeightField = (unit: MeasurementUnit) =>
  z
    .string()
    .min(1, "Вкажіть ваш зріст")
    .refine((value) => {
      const parsed = Number(value);
      if (Number.isNaN(parsed)) return false;
      if (unit === "cm") return parsed >= 100 && parsed <= 250;
      return parsed >= 39 && parsed <= 98;
    }, unit === "cm"
      ? "Зріст має бути від 100 до 250 см"
      : "Зріст має бути від 39 до 98 дюймів");

export const FINAL_MEASUREMENT_FIELD = "height" as const;

export const getMeasurementUnitLabel = (unit: MeasurementUnit) =>
  MEASUREMENT_UNIT_LABELS[unit];

/** Ukrainian labels for backend / Telegram (UI texts live in i18n) */
export const MEASUREMENT_LABELS_UK = {
  waist_definition: "Визначаємо лінію талії",
  chest: "Обхват грудей",
  waist: "Обхват талії",
  hips: "Обхват стегон",
  shoulders: "А2Т2",
  shoulders_back: "А8Т8",
  side_height: "Висота бока",
  seat_height: "Висота сидіння",
  arm_length: "Довжина руки",
  wrist: "Обхват зап'ястя",
  arm_girth: "Обхват руки",
  seat_length: "Довжина сидіння",
  arch: "Дуга",
  neck: "Обхват шиї",
  product_length: "Довжина виробу",
  pants_length: "Довжина штанів",
  pants_bottom_width: "Ширина штанів по низу",
  height: "Зріст",
} as const;

export const formatMeasurementEntry = (
  key: string,
  value: string,
  unit: MeasurementUnit,
) => {
  const label =
    MEASUREMENT_LABELS_UK[key as keyof typeof MEASUREMENT_LABELS_UK] ?? key;
  return `${label}: ${value} ${getMeasurementUnitLabel(unit)}`;
};

// Photo catalog for measurement instructions (UI copy is in i18n)
export const MEASUREMENTS_CATALOG = {
  waist_definition: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633245/Photoroom_20260622_182320-Photoroom.png",
  },
  chest: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633162/Photoroom_20260622_181549-Photoroom.jpg",
  },
  waist: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633162/Photoroom_20260622_181526-Photoroom.png",
  },
  hips: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633165/Photoroom_20260622_181449-Photoroom.png",
  },
  shoulders: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633244/Photoroom_20260622_182008-Photoroom.jpg",
  },
  shoulders_back: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633244/Photoroom_20260622_181944-Photoroom.jpg",
  },
  side_height: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633243/Photoroom_20260622_181831-Photoroom.png",
  },
  seat_height: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633245/Photoroom_20260622_182958-Photoroom.png",
  },
  arm_length: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633242/Photoroom_20260622_181731-Photoroom.png",
  },
  wrist: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633161/Photoroom_20260622_181427-Photoroom.jpg",
  },
  arm_girth: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633161/Photoroom_20260622_181327-Photoroom.jpg",
  },
  seat_length: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633174/Photoroom_20260622_181707-Photoroom.png",
  },
  arch: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633243/Photoroom_20260622_181920-Photoroom.jpg",
  },
  neck: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633161/Photoroom_20260622_181350-Photoroom.jpg",
  },
  product_length: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633243/Photoroom_20260622_181809-Photoroom.jpg",
  },
  pants_length: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633246/Photoroom_20260622_183505-Photoroom.jpg",
  },
  pants_bottom_width: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633246/Photoroom_20260622_183234-Photoroom.jpg",
  },
  height: {
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633243/Photoroom_20260622_181809-Photoroom.jpg",
  },
} as const;

export const MEASUREMENT_CONFIG = {
  body: {
    label: "Боді",
    fields: [
      "waist_definition",
      "waist",
      "chest",
      "hips",
      "shoulders",
      "shoulders_back",
      "side_height",
      "seat_height",
      "arm_length",
      "wrist",
      "arm_girth",
      "seat_length",
      "arch",
      "neck",
    ],
  },
  jacket: {
    label: "Піджак / жилет",
    fields: [
      "waist_definition",
      "waist",
      "chest",
      "hips",
      "shoulders",
      "shoulders_back",
      "arm_girth",
      "arm_length",
      "side_height",
      "product_length",
    ],
  },
  pants: {
    label: "Штани",
    fields: [
      "waist_definition",
      "waist",
      "hips",
      "seat_height",
      "pants_length",
      "pants_bottom_width",
    ],
  },
  suit: {
    label: "Костюм",
    fields: [
      "waist_definition",
      "waist",
      "chest",
      "hips",
      "shoulders",
      "shoulders_back",
      "side_height",
      "seat_height",
      "arm_length",
      "wrist",
      "arm_girth",
      "seat_length",
      "arch",
      "neck",
      "product_length",
      "pants_length",
      "pants_bottom_width",
    ],
  },
} as const;

export const getMeasurementSchema = (
  type: keyof typeof MEASUREMENT_CONFIG,
  unit: MeasurementUnit = "cm",
) => {
  const fields = MEASUREMENT_CONFIG[type].fields;
  const schema: Record<string, z.ZodTypeAny> = {};

  fields.forEach((fieldKey) => {
    if (fieldKey === "waist_definition") return;
    schema[fieldKey] = createRequiredMeasurementField(unit);
  });

  schema[FINAL_MEASUREMENT_FIELD] = createHeightField(unit);

  return z.object(schema);
};

export type MeasurementType = keyof typeof MEASUREMENT_CONFIG;
