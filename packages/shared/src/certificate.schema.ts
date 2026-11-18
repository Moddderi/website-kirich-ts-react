import { z } from "zod";
import { checkoutFieldsSchema } from "./checkoutFields.schema.js";

/** Fixed denominations — arbitrary amounts (e.g. 2120) are not allowed. */
export const GIFT_CERTIFICATE_AMOUNTS_UAH = [
  500, 1000, 1500, 2000, 2500, 3000, 5000, 10000,
] as const;

export const giftCertificateAmountSchema = z.union([
  z.literal(500),
  z.literal(1000),
  z.literal(1500),
  z.literal(2000),
  z.literal(2500),
  z.literal(3000),
  z.literal(5000),
  z.literal(10000),
]);

export const MIN_GIFT_CERTIFICATE_NUMBER = 1021;

/** Secret code shown to the client and entered at checkout (not the public №). */
export const ELECTRONIC_CERTIFICATE_CODE_PATTERN =
  /^KIR-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

/** Checkout / validate: electronic code or legacy № (rows without electronicCode). */
export const isRedemptionCertificateCode = (code: string) => {
  const trimmed = code.trim();
  if (ELECTRONIC_CERTIFICATE_CODE_PATTERN.test(trimmed.toUpperCase())) {
    return true;
  }
  return /^\d{4,6}$/.test(trimmed);
};

export const normalizeRedemptionCertificateCode = (code: string) => {
  const trimmed = code.trim();
  if (ELECTRONIC_CERTIFICATE_CODE_PATTERN.test(trimmed.toUpperCase())) {
    return trimmed.toUpperCase();
  }
  return trimmed;
};

export const electronicCertificateCodeSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine(
    (v) => ELECTRONIC_CERTIFICATE_CODE_PATTERN.test(v),
    "Введіть електронний код (наприклад KIR-7X3M-9P2K)",
  );

/** @deprecated Use electronicCertificateCodeSchema — kept as alias for imports. */
export const certificateCodeSchema = electronicCertificateCodeSchema;

const isPostalDelivery = (method: string | undefined) =>
  method === "nova_poshta" || method === "ukrposhta";

/** Purchase form — separate from cart / tailoring checkout. */
export const giftCertificatePurchaseSchema = z
  .object({
    firstName: checkoutFieldsSchema.shape.firstName,
    lastName: checkoutFieldsSchema.shape.lastName,
    phone: checkoutFieldsSchema.shape.phone,
    email: checkoutFieldsSchema.shape.email,
    communicationMethod: checkoutFieldsSchema.shape.communicationMethod,
    socialUsername: checkoutFieldsSchema.shape.socialUsername,
    comment: checkoutFieldsSchema.shape.comment,
    paymentMethod: z.literal("online"),
    amountUah: giftCertificateAmountSchema,
    requestPhysicalDelivery: z.boolean(),
    deliveryMethod: checkoutFieldsSchema.shape.deliveryMethod.optional(),
    city: checkoutFieldsSchema.shape.city,
    warehouse: checkoutFieldsSchema.shape.warehouse,
  })
  .superRefine((data, ctx) => {
    if (!data.requestPhysicalDelivery) return;
    if (!data.deliveryMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Оберіть спосіб доставки",
        path: ["deliveryMethod"],
      });
      return;
    }
    if (isPostalDelivery(data.deliveryMethod)) {
      if (!data.city?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Вкажіть місто",
          path: ["city"],
        });
      }
      if (!data.warehouse?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Вкажіть відділення",
          path: ["warehouse"],
        });
      }
    }
  });

/** «Покупець» in Notion — person who pays (from checkout contact fields). */
export const giftCertificateBuyerLabel = (
  firstName: string,
  lastName: string,
) => `${lastName.trim()} ${firstName.trim()}`.trim();

export type GiftCertificateAmount =
  (typeof GIFT_CERTIFICATE_AMOUNTS_UAH)[number];

export type GiftCertificatePurchase = z.output<
  typeof giftCertificatePurchaseSchema
>;

export const giftCertificateValidateQuerySchema = z.object({
  code: electronicCertificateCodeSchema,
  orderTotalUah: z.coerce.number().nonnegative().optional(),
});

export type GiftCertificateValidateQuery = z.infer<
  typeof giftCertificateValidateQuerySchema
>;

export const GIFT_CERTIFICATE_STATUSES = [
  "inactive",
  "active",
  "used",
  "expired",
] as const;

export type GiftCertificateStatus = (typeof GIFT_CERTIFICATE_STATUSES)[number];

/** Buyer cabinet view of a purchased certificate. */
export type CabinetCertificate = {
  token: string;
  giftShareToken: string;
  number: number;
  electronicCode: string;
  amountUah: number;
  validUntil: string;
  purchasedAt: string;
  status: GiftCertificateStatus;
  buyerLabel: string;
};

/** Public gift page — no contacts, only what the recipient needs. */
export type PublicGiftCertificate = {
  number: number;
  electronicCode: string;
  amountUah: number;
  validUntil: string;
  status: GiftCertificateStatus;
  fromName: string;
};