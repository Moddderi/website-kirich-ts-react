import { Op } from "sequelize";
import {
  ELECTRONIC_CERTIFICATE_CODE_PATTERN,
  MIN_GIFT_CERTIFICATE_NUMBER,
  giftCertificateBuyerLabel,
  type GiftCertificatePurchase,
  todayISO,
} from "@project/shared";
import db from "../models/index.js";
import {
  generateElectronicCertificateCode,
  normalizeElectronicCertificateCode,
} from "../utils/certificateCode.js";
import {
  createNotionGiftCertificate,
  getNotionGiftCertificateStatus,
  giftCertificateValidityEnd,
  formatPhysicalDeliveryNote,
  markNotionGiftCertificateUsed,
} from "../utils/notionCertificates.js";
import { describeClientMessenger, sendTelegramText } from "../utils/telegram.js";
import { sendGiftCertificateEmail } from "../utils/email.js";

export type CertificatePreview = {
  number: number;
  amountUah: number;
  validUntil: string;
  discountUah: number;
};

const parseAmount = (value: unknown): number => Number(value);

const isExpired = (validUntil: string, today: string) => validUntil < today;

const findCertificateByRedemptionCode = async (code: string) => {
  const raw = code.trim();
  const upper = normalizeElectronicCertificateCode(raw);

  if (ELECTRONIC_CERTIFICATE_CODE_PATTERN.test(upper)) {
    const cert = await db.GiftCertificate.findOne({
      where: { electronicCode: upper },
    });
    if (cert) return cert;
    throw new Error("Електронний код не знайдено. Перевірте написання.");
  }

  const legacy = Number.parseInt(raw, 10);
  if (Number.isInteger(legacy) && /^\d{4,6}$/.test(raw)) {
    const cert = await db.GiftCertificate.findOne({ where: { number: legacy } });
    if (cert) {
      if (!cert.electronicCode) {
        return cert;
      }
      throw new Error(
        "Для цього сертифіката потрібен електронний код — дивіться лист або зверніться до студії.",
      );
    }
    throw new Error("Сертифікат не знайдено.");
  }

  throw new Error("Невірний формат коду. Потрібен KIR-XXXX-XXXX.");
};

/** Reads Notion «Статус» and mirrors it into Neon (manager’s Активний → code works on site). */
const syncCertificateStatusFromNotion = async (
  cert: InstanceType<typeof db.GiftCertificate>,
) => {
  if (!cert.notionPageId) return cert;
  try {
    const notionStatus = await getNotionGiftCertificateStatus(cert.notionPageId);
    if (notionStatus && notionStatus !== cert.status) {
      await cert.update({ status: notionStatus });
      await cert.reload();
    }
  } catch (error) {
    console.error(`❌ Notion статус сертифіката №${cert.number}:`, error);
  }
  return cert;
};

const assertCertificateUsable = async (
  cert: InstanceType<typeof db.GiftCertificate>,
) => {
  await syncCertificateStatusFromNotion(cert);

  const today = todayISO();
  if (cert.status === "inactive") {
    throw new Error(
      "Сертифікат ще не активований. Після підтвердження оплати зверніться до менеджера.",
    );
  }
  if (cert.status === "used") {
    throw new Error("Цей сертифікат уже використано.");
  }
  if (cert.status === "expired" || isExpired(cert.validUntil, today)) {
    if (cert.status === "active") {
      await cert.update({ status: "expired" });
    }
    throw new Error("Термін дії сертифіката минув.");
  }
};

export const previewCertificateDiscount = async (
  code: string,
  orderTotalUah?: number,
): Promise<CertificatePreview> => {
  const cert = await findCertificateByRedemptionCode(code);
  await assertCertificateUsable(cert);

  const amountUah = parseAmount(cert.amountUah);
  const discountUah =
    orderTotalUah != null && Number.isFinite(orderTotalUah)
      ? Math.min(amountUah, Math.max(0, orderTotalUah))
      : amountUah;

  return {
    number: cert.number,
    amountUah,
    validUntil: cert.validUntil,
    discountUah,
  };
};

export const lockCertificateForRedemption = async (
  code: string,
  transaction: Awaited<ReturnType<typeof db.sequelize.transaction>>,
) => {
  const raw = code.trim();
  const upper = normalizeElectronicCertificateCode(raw);

  let cert: InstanceType<typeof db.GiftCertificate> | null = null;

  if (ELECTRONIC_CERTIFICATE_CODE_PATTERN.test(upper)) {
    cert = await db.GiftCertificate.findOne({
      where: { electronicCode: upper },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
    if (!cert) throw new Error("Електронний код не знайдено.");
  } else {
    const legacy = Number.parseInt(raw, 10);
    if (!Number.isInteger(legacy) || !/^\d{4,6}$/.test(raw)) {
      throw new Error("Невірний формат коду сертифіката.");
    }
    cert = await db.GiftCertificate.findOne({
      where: { number: legacy },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
    if (!cert) throw new Error("Сертифікат не знайдено.");
    if (cert.electronicCode) {
      throw new Error("Введіть електронний код сертифіката (KIR-…).");
    }
  }

  await assertCertificateUsable(cert);
  return cert;
};

export const computeCertificateDiscount = (
  certAmountUah: number,
  orderGrossUah: number,
) => Math.min(certAmountUah, Math.max(0, orderGrossUah));

export const redeemCertificateForOrder = async (opts: {
  cert: InstanceType<typeof db.GiftCertificate>;
  orderId: string;
  discountUah: number;
  clientName: string;
  transaction: Awaited<ReturnType<typeof db.sequelize.transaction>>;
}) => {
  const { cert, orderId, clientName, transaction } = opts;
  const today = todayISO();

  await cert.update(
    {
      status: "used",
      usedAt: today,
      usedOrderId: orderId,
    },
    { transaction },
  );

  const shortId = String(orderId).split("-")[0].toUpperCase();
  if (cert.notionPageId) {
    void markNotionGiftCertificateUsed(cert.notionPageId, {
      usedAt: today,
      clientName,
      orderShortId: shortId,
    }).catch((error) => {
      console.error("❌ Notion certificate redeem:", error);
      void sendTelegramText(
        `⚠️ Сертифікат №${cert.number} використано в замовленні №${shortId}, але Notion не оновлено.`,
      );
    });
  }
};

const nextCertificateNumber = async (
  transaction: Awaited<ReturnType<typeof db.sequelize.transaction>>,
) => {
  const row = await db.GiftCertificate.findOne({
    attributes: ["number"],
    order: [["number", "DESC"]],
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  const max = row?.number ?? MIN_GIFT_CERTIFICATE_NUMBER - 1;
  const next = Math.max(MIN_GIFT_CERTIFICATE_NUMBER, max + 1);
  return next;
};

export const purchaseGiftCertificate = async (
  payload: GiftCertificatePurchase,
) => {
  // Validated by giftCertificatePurchaseSchema before the controller runs.
  const {
    firstName,
    lastName,
    phone,
    email,
    amountUah,
    communicationMethod,
    socialUsername,
    comment,
    requestPhysicalDelivery,
    deliveryMethod,
    city,
    warehouse,
  } = payload;

  const transaction = await db.sequelize.transaction();
  let cert: InstanceType<typeof db.GiftCertificate> | null = null;
  let electronicCode = generateElectronicCertificateCode();

  try {
    const purchasedAt = todayISO();
    const validUntil = giftCertificateValidityEnd(purchasedAt);
    const number = await nextCertificateNumber(transaction);
    const buyerLabel = giftCertificateBuyerLabel(firstName!, lastName!);

    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        cert = await db.GiftCertificate.create(
          {
            number,
            electronicCode,
            amountUah: amountUah!,
            buyerLabel,
            purchaserFirstName: firstName!,
            purchaserLastName: lastName!,
            purchaserPhone: phone!,
            purchaserEmail: email!,
            purchasedAt,
            validUntil,
            status: "inactive",
            communicationMethod: payload.communicationMethod,
            socialUsername: payload.socialUsername,
            comment: comment?.trim() || null,
            requestPhysicalDelivery: Boolean(requestPhysicalDelivery),
            deliveryMethod: requestPhysicalDelivery
              ? (deliveryMethod ?? null)
              : null,
            deliveryCity: requestPhysicalDelivery
              ? (city?.trim() || null)
              : null,
            deliveryWarehouse: requestPhysicalDelivery
              ? (warehouse?.trim() || null)
              : null,
          },
          { transaction },
        );
        break;
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          error.name === "SequelizeUniqueConstraintError"
        ) {
          electronicCode = generateElectronicCertificateCode();
          continue;
        }
        throw error;
      }
    }

    if (!cert) {
      throw new Error("Не вдалося створити електронний код сертифіката.");
    }

    await transaction.commit();

    const certDbId = process.env.NOTION_CERTIFICATES_DATABASE_ID?.trim();
    if (!certDbId) {
      void sendTelegramText(
        `⚠️ Сертифікат №${number} оформлено на сайті, але в Notion немає запису: додайте NOTION_CERTIFICATES_DATABASE_ID у .env і підключіть інтеграцію до [DB] Сертифікати.`,
      );
    }

    const notion = certDbId
      ? await createNotionGiftCertificate({
          number: cert.number,
          electronicCode: cert.electronicCode!,
          amountUah: amountUah!,
          buyerLabel: cert.buyerLabel,
          purchasedAt,
          validUntil,
          purchaserFirstName: firstName!,
          purchaserLastName: lastName!,
          purchaserPhone: phone!,
          purchaserEmail: email!,
          comment,
          physicalDelivery: requestPhysicalDelivery
            ? {
                method: deliveryMethod!,
                city,
                warehouse,
              }
            : null,
        }).catch((error) => {
          console.error("❌ Notion gift certificate:", error);
          const detail =
            error instanceof Error ? error.message.slice(0, 200) : "помилка";
          void sendTelegramText(
            `⚠️ Сертифікат №${number} не потрапив у Notion (${detail}). Додайте рядок у [DB] Сертифікати вручну.`,
          );
          return null;
        })
      : null;

    if (notion?.id && notion.id !== "dry-run-page-id") {
      await cert.update({ notionPageId: notion.id });
    }

    const messenger = describeClientMessenger(
      communicationMethod!,
      socialUsername!,
    );

    void sendTelegramText(
      `🎁 Новий подарунковий сертифікат №${number}\n` +
        `🔐 Електронний код: ${cert.electronicCode}\n` +
        `Сума: ${amountUah} грн\n` +
        `Покупець: ${cert.buyerLabel}\n` +
        `📞 ${phone}\n` +
        `📧 ${email}\n` +
        `💬 Куди писати: ${messenger.label}\n` +
        `📲 Контакт: ${messenger.contact}\n` +
        `💳 Оплата: онлайн (менеджер надішле реквізити)\n` +
        (requestPhysicalDelivery
          ? `📦 Фізичний сертифікат: ${formatPhysicalDeliveryNote({
              method: deliveryMethod!,
              city,
              warehouse,
            })}\n`
          : "") +
        `Діє до: ${validUntil}\n` +
        `📌 У Notion зараз «Неактивний» — після оплати поставте «Активний» (код на сайті підхопить за ~2 хв).`,
    );

    void sendGiftCertificateEmail({
      email: email!,
      firstName: firstName!,
      lastName: lastName!,
      phone: phone!,
      number: cert.number,
      electronicCode: cert.electronicCode!,
      amountUah: amountUah!,
      validUntil,
      buyerLabel: cert.buyerLabel,
      paymentMethod: "online",
      communicationMethod: communicationMethod!,
      socialUsername: socialUsername!,
      physicalDeliveryNote: requestPhysicalDelivery
        ? formatPhysicalDeliveryNote({
            method: deliveryMethod!,
            city,
            warehouse,
          })
        : undefined,
    });

    return {
      id: cert.id,
      number: cert.number,
      electronicCode: cert.electronicCode!,
      amountUah: amountUah!,
      validUntil,
      buyerLabel: cert.buyerLabel,
    };
  } catch (error) {
    await transaction.rollback();
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "SequelizeUniqueConstraintError"
    ) {
      throw new Error(
        "Не вдалося виділити номер сертифіката. Спробуйте ще раз.",
      );
    }
    throw error;
  }
};

export const expireStaleCertificates = async () => {
  const today = todayISO();
  await db.GiftCertificate.update(
    { status: "expired" },
    {
      where: {
        status: { [Op.in]: ["active", "inactive"] },
        validUntil: { [Op.lt]: today },
      },
    },
  );
};