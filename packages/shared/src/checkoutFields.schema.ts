import { z } from "zod";

/** Shared contact / checkout fields (cart, tailoring, gift certificate). */
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
  communicationMethod: z.enum([
    "telegram",
    "instagram",
    "whatsapp",
    "viber",
    "signal",
  ]),
  socialUsername: z
    .string()
    .min(1, "Будь ласка, вкажіть ваш нікнейм або телефон для зв'язку"),
  comment: z
    .string()
    .max(1000, "Коментар має містити не більше 1000 символів")
    .optional(),
});