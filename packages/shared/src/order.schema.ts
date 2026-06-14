import { z } from "zod";

export const checkoutSchema = z
  .object({
    firstName: z.string().min(2, "Ім'я має містити мінімум 2 символи"),
    lastName: z.string().min(2, "Прізвище має містити мінімум 2 символи"),
    phone: z
      .string()
      .regex(
        /^\+?3?8?(0\d{9})$/,
        "Невірний формат телефону (наприклад: +380991234567)",
      ),
    email: z.string().email("Введіть коректну електронну адресу"),
    deliveryMethod: z.enum(["nova_poshta", "pickup"]),
    city: z.string().optional(),
    warehouse: z.string().optional(),
    paymentMethod: z.enum(["online", "cod"]),

    // Оставляем только две соцсети
    communicationMethod: z.enum(["telegram", "instagram"]),
    socialUsername: z
      .string()
      .min(1, "Будь ласка, вкажіть ваш нікнейм для зв'язку"),
  })
  .refine(
    (data) => {
      if (data.deliveryMethod === "nova_poshta") {
        return !!data.city && !!data.warehouse;
      }
      return true;
    },
    {
      message: "Будь ласка, вкажіть місто та відділення доставки",
      path: ["city"],
    },
  );

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
