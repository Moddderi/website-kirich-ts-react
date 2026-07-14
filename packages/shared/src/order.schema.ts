import { z } from "zod";
import { customMeasurementsSchema } from "./measurements.schema.js";

export const currencySchema = z.enum(["UAH", "USD", "EUR"]);

// 1. Базовый объект полей формы
export const checkoutFieldsSchema = z.object({
  firstName: z.string().min(2, "Ім'я має містити мінімум 2 символи"),
  lastName: z.string().min(2, "Прізвище має містити мінімум 2 символи"),
  phone: z
    .string()
    .regex(
      /^\+?3?8?(0\d{9})$/,
      "Невірний формат телефону (наприклад: +380991234567)",
    ),
  email: z.string().email("Введіть коректну електронну адресу"),
  deliveryMethod: z.enum(["nova_poshta", "ukrposhta", "pickup"]),
  city: z.string().optional(),
  warehouse: z.string().optional(),
  paymentMethod: z.enum(["online", "cod"]),
  communicationMethod: z.enum(["telegram", "instagram", "whatsapp"]),
  socialUsername: z
    .string()
    .min(1, "Будь ласка, вкажіть ваш нікнейм або телефон для зв'язку"),
});

const isPostalDelivery = (method: string) =>
  method === "nova_poshta" || method === "ukrposhta";

// Схема для валидации одного товара/услуги в заказе
export const orderItemSchema = z.object({
  productId: z.string().nullable().optional(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  color: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  measurements: z.record(z.string()).nullable().optional(),
});

// 2. Схема с проверкой заполнения города и отделения
export const checkoutSchema = checkoutFieldsSchema.refine(
  (data) => {
    if (isPostalDelivery(data.deliveryMethod)) {
      return !!data.city && !!data.warehouse;
    }
    return true;
  },
  {
    message: "Будь ласка, вкажіть місто та відділення доставки",
    path: ["city"],
  },
);

// 3. Схема для готового замовлення
export const readyMadeOrderSchema = checkoutFieldsSchema.extend({
  orderType: z.literal("ready-made"),
  totalAmount: z.number().positive("Сума замовлення має бути більше 0"),
  status: z.string(),
  displayCurrency: currencySchema.optional().default("UAH"),
  items: z.array(orderItemSchema),
});

// 4. Схема для кастомного / індивідуального замовлення
export const customOrderSchema = checkoutFieldsSchema.extend({
  orderType: z.literal("custom"),
  totalAmount: z.number().nonnegative(),
  status: z.string(),
  displayCurrency: currencySchema.optional().default("UAH"),
  measurements: customMeasurementsSchema,
  items: z.array(orderItemSchema),
});

// 5. Главная дискриминированная схема
export const orderPayloadSchema = z.discriminatedUnion("orderType", [
  readyMadeOrderSchema,
  customOrderSchema,
]);

// Экспорт типов
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
export type OrderPayload = z.infer<typeof orderPayloadSchema>;
export type ReadyMadeOrder = z.infer<typeof readyMadeOrderSchema>;
export type CustomOrder = z.infer<typeof customOrderSchema>;
