import { z } from "zod";
import { customMeasurementsSchema } from "./measurements.schema.js";
import { isRedemptionCertificateCode } from "./certificate.schema.js";
import { checkoutFieldsSchema } from "./checkoutFields.schema.js";

export { checkoutFieldsSchema } from "./checkoutFields.schema.js";

export const currencySchema = z.enum(["UAH", "USD", "EUR"]);

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
export const checkoutSchema = checkoutFieldsSchema
  .extend({
    certificateCode: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length > 0 ? v : undefined)),
  })
  .refine(
    (data) => {
      if (
        data.certificateCode &&
        !isRedemptionCertificateCode(data.certificateCode)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Введіть електронний код (наприклад KIR-7X3M-9P2K)",
      path: ["certificateCode"],
    },
  )
  .refine(
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
  /** Gift certificate electronic code (or legacy № for old rows). */
  certificateCode: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isRedemptionCertificateCode(v), {
      message: "Введіть електронний код (наприклад KIR-7X3M-9P2K)",
    }),
  items: z.array(orderItemSchema),
});

// 4. Схема для кастомного / індивідуального замовлення
export const customOrderSchema = checkoutFieldsSchema.extend({
  orderType: z.literal("custom"),
  totalAmount: z.number().nonnegative(),
  status: z.string(),
  displayCurrency: currencySchema.optional().default("UAH"),
  measurements: customMeasurementsSchema,
  /** Garments the client selected; the server recomputes price range / dates from them */
  /** Per garment: e.g. { pants: "LAT", body: "ST" } */
  tailoringPrograms: z.record(z.string(), z.enum(["ST", "LAT"])).optional(),
  tailoringCategory: z.enum(["competition", "training"]).optional(),
  tailoringOrderProgram: z.enum(["ST", "LAT"]).optional(),
  tailoringLines: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(5),
      }),
    )
    .optional(),
  /** In-stock accessories (bow tie, belt, tie, magnets) shipped with this tailoring order. */
  readyAccessories: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(5),
        size: z.string().trim().min(1).max(40).optional(),
      }),
    )
    .max(12)
    .optional(),
  /** Start date picked by the client in the calendar (YYYY-MM-DD); validated on the server */
  preferredStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  tailoringTypes: z
    .array(z.enum(["body", "jacket", "pants", "suit"]))
    .min(1, "Оберіть хоча б один виріб"),
  /** How many of each garment (defaults to 1). Suit is always treated as 1. */
  tailoringQuantities: z
    .record(
      z.enum(["body", "jacket", "pants", "suit"]),
      z.number().int().min(1).max(5),
    )
    .optional(),
  certificateCode: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isRedemptionCertificateCode(v), {
      message: "Введіть електронний код (наприклад KIR-7X3M-9P2K)",
    }),
  /** Inspiration photos uploaded before checkout (Cloudinary URLs). */
  referenceImageUrls: z.array(z.string().url()).max(5).optional(),
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
