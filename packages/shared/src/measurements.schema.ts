import { z } from "zod";

export const MeasurementFields = {
  chest: z.string().min(1, "Обов'язкове поле"),
  waist: z.string().min(1, "Обов'язкове поле"),
  hips: z.string().min(1, "Обов'язкове поле"),
  shoulders: z.string().min(1, "Обов'язкове поле"),
  sleeve: z.string().min(1, "Обов'язкове поле"),
  inseam: z.string().min(1, "Обов'язкове поле"),
};

export const MEASUREMENT_CONFIG = {
  top: {
    label: "Верх",
    fields: ["chest", "waist", "shoulders", "sleeve"],
  },
  bottom: {
    label: "Низ",
    fields: ["hips", "inseam"],
  },
  set: {
    label: "Комплект",
    fields: ["chest", "waist", "hips", "shoulders", "sleeve", "inseam"],
  },
};

export const getMeasurementSchema = (type: keyof typeof MEASUREMENT_CONFIG) => {
  const fields = MEASUREMENT_CONFIG[type].fields;
  const schema: Record<string, z.ZodString> = {};

  fields.forEach((field) => {
    schema[field] = MeasurementFields[field as keyof typeof MeasurementFields];
  });

  return z.object(schema);
};

export type MeasurementType = keyof typeof MEASUREMENT_CONFIG;
