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

export const formatMeasurementEntry = (
  key: string,
  value: string,
  unit: MeasurementUnit,
) => {
  const measurementInfo =
    MEASUREMENTS_CATALOG[key as keyof typeof MEASUREMENTS_CATALOG];
  const label = measurementInfo?.name ?? key;
  return `${label}: ${value} ${getMeasurementUnitLabel(unit)}`;
};

// 1. Определяем все возможные мерки с их описаниями и превью-изображениями
export const MEASUREMENTS_CATALOG = {
  waist_definition: {
    name: "Визначаємо лінію талії",
    description:
      "Зав’язуємо резинку, щоб визначити розташування найтоншого місця тулуба – талії. Більшість мірок вимірюється до/від цієї лінії",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633245/Photoroom_20260622_182320-Photoroom.png",
    validator: z.any().optional(),
  },
  chest: {
    name: "Обхват грудей",
    description:
      "Мірка вимірюється по самим виступаючим точкам грудей, зі сторони спини проходячи через лопатки. При знятті даної мірки не варто занадто сильно натягувати чи послаблювати сантиметрову стрічку, вона повинна щільно, але без стягування, охоплювати грудну клітину",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633162/Photoroom_20260622_181549-Photoroom.jpg",
    validator: z.any().optional(),
  },
  waist: {
    name: "Обхват талії",
    description:
      "Мірка вимірюється по самому вузькому місцю на тулубі, щільно обхопивши талію сантиметровою стрічкою, але не стягуючи її",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633162/Photoroom_20260622_181526-Photoroom.png",
    validator: z.any().optional(),
  },
  hips: {
    name: "Обхват стегон",
    description: "Мірка вимірюється через найвипукліші зони сідниць",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633165/Photoroom_20260622_181449-Photoroom.png",
    validator: z.any().optional(),
  },
  shoulders: {
    name: "А2Т2",
    description:
      "Мірка вимірюється від основи шиї на рівні уявного плечевого шва через центр грудей до лінії талії вертикально",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633244/Photoroom_20260622_182008-Photoroom.jpg",
    validator: z.any().optional(),
  },
  shoulders_back: {
    name: "А8Т8",
    description:
      "Мірка вимірюється по спині від основи шиї на рівні уявного плечевого шва до лінії талії вертикально вниз",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633244/Photoroom_20260622_181944-Photoroom.jpg",
    validator: z.any().optional(),
  },
  side_height: {
    name: "Висота бока",
    description: "Мірка вимірюється по боковому шву від пахви до лінії талії",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633243/Photoroom_20260622_181831-Photoroom.png",
    validator: z.any().optional(),
  },
  seat_height: {
    name: "Висота сидіння",
    description:
      "Для зняття мірки необхідно посадити людину на стілець, спина при цьому рівна. Мірка вимірюється двічі: одне значення ззаду від талії до сидіння стільця, друге значення збоку від талії до сидіння стільця. Записується те значення, що більше",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633245/Photoroom_20260622_182958-Photoroom.png",
    validator: z.any().optional(),
  },
  arm_length: {
    name: "Довжина руки",
    description:
      "Мірка вимірюється вертикально від краю плеча до зап’ястя уздовж зовнішньої сторони руки. При знятті даної мірки рука повинна бути випрямлена уздовж тулуба",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633243/Photoroom_20260622_181809-Photoroom.jpg",
    validator: z.any().optional(),
  },
  wrist: {
    name: "Обхват зап'ястя",
    description:
      "Мірка знімається горизонтальним обхватом по лінії зап’ястя, в місці передбачуваного манжета",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633161/Photoroom_20260622_181427-Photoroom.jpg",
    validator: z.any().optional(),
  },
  arm_girth: {
    name: "Обхват руки",
    description:
      "Мірка вимірюється горизонтальним обхватом по найширшій верхній частині руки, при цьому рука вільно опущена вниз",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633161/Photoroom_20260622_181327-Photoroom.jpg",
    validator: z.any().optional(),
  },
  seat_length: {
    name: "Довжина сидіння",
    description: "Мірка вимірюється напівдугою від талії до талії через пах",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633174/Photoroom_20260622_181707-Photoroom.png",
    validator: z.any().optional(),
  },
  arch: {
    name: "Дуга",
    description:
      "Мірка вимірюється шляхом обхвату тулуба через пах до основи шиї",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633243/Photoroom_20260622_181920-Photoroom.jpg",
    validator: z.any().optional(),
  },
  neck: {
    name: "Обхват шиї",
    description:
      "Мірка вимірюється навкруги шиї в місці передбачуваного комірця, сантиметрова стрічка замикається на яремній западині",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633161/Photoroom_20260622_181350-Photoroom.jpg",
    validator: z.any().optional(),
  },
  product_length: {
    name: "Довжина виробу",
    description:
      "Мірка вимірюється від лінії талії до бажаного низу майбутнього виробу",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633243/Photoroom_20260622_181809-Photoroom.jpg",
    validator: z.any().optional(),
  },
  pants_length: {
    name: "Довжина штанів",
    description:
      "Мірка вимірюється від лінії талії до низу штанів уздовж зовнішньої сторони ноги. Для цієї мірки краще взути танцювальні туфлі та вимірювати довжину з урахуванням висоти підборів",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633246/Photoroom_20260622_183505-Photoroom.jpg",
    validator: z.any().optional(),
  },
  pants_bottom_width: {
    name: "Ширина штанів по низу",
    description:
      "Мірка вимірюється шляхом підбору бажаної ширини штанів по низу. Ця мірка вимірюється у взутті",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633246/Photoroom_20260622_183234-Photoroom.jpg",
    validator: z.any().optional(),
  },
  height: {
    name: "Зріст",
    description: "Вкажіть ваш зріст у обраних одиницях виміру без взуття",
    imageUrl:
      "https://res.cloudinary.com/dqe2odzsc/image/upload/v1782633243/Photoroom_20260622_181809-Photoroom.jpg",
    validator: z.any().optional(),
  },
} as const;

// 2. Конфигурация типов изделий (4 штуки) с массивами ключей мерок
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

// Динамический генератор Zod-схемы для валидации на бэкенде/фронте
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
