import { Op } from "sequelize";
import {
  TAILORING_GARMENTS,
  addDaysISO,
  calcTailoringEstimate,
  calcTailoringLinesEstimate,
  canStartOn,
  clampGarmentQty,
  clampLineQty,
  expandTailoringTypes,
  formatAccessorySize,
  getTailoringProduct,
  isFarOrder,
  isValidAccessorySize,
  pickWorkDays,
  sumWorkDaysForSelection,
  todayISO,
  type MeasurementType,
  type OrderPayload,
  type TailoringLine,
  type TailoringProgram,
} from "@project/shared";
import { loadCatalogLeadDays } from "../utils/catalogLeadDaysStore.js";
import db from "../models/index.js";
import { getAvailability } from "../utils/availability.js";
import {
  sendTelegramNotification,
  sendTelegramText,
} from "../utils/telegram.js";
import { createNotionOrder, getWorkDaysTable } from "../utils/notionOrders.js";
import { generateAccessToken } from "../utils/cabinet.js";
import { sendOrderConfirmationEmail } from "../utils/email.js";
import {
  computeCertificateDiscount,
  lockCertificateForRedemption,
  redeemCertificateForOrder,
} from "./certificateService.js";

interface StoredOrderItem {
  name: string;
  quantity: number;
  price: number;
  productId?: string | null;
  color?: string | null;
  size?: string | null;
  isAccessory?: boolean;
}

interface StoredAccessory {
  productId: number;
  name: string;
  quantity: number;
  priceUah: number;
  size: string | null;
}

const resolveReadyAccessories = async (
  input:
    | Array<{ productId?: string; quantity?: number; size?: string }>
    | undefined,
): Promise<StoredAccessory[]> => {
  if (!Array.isArray(input) || input.length === 0) return [];

  type AccessoryProduct = {
    id: number;
    name: string;
    name_en?: string | null;
    price: number | string;
    main_category: string;
    sub_type?: string | null;
  };

  const merged = new Map<string, { id: number; size: string | null; quantity: number }>();
  for (const row of input) {
    const id = Number(row?.productId);
    const qty = Math.min(5, Math.max(1, Math.floor(Number(row?.quantity) || 1)));
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Некоректний аксесуар у замовленні.");
    }
    const size = typeof row?.size === "string" && row.size.trim() ? row.size.trim() : null;
    const key = `${id}::${size ?? ""}`;
    const prev = merged.get(key);
    merged.set(key, {
      id,
      size,
      quantity: Math.min(5, (prev?.quantity ?? 0) + qty),
    });
  }
  if (merged.size > 12) {
    throw new Error("Забагато аксесуарів у замовленні.");
  }

  const products = await db.Product.findAll({
    where: { id: { [Op.in]: [...new Set([...merged.values()].map((row) => row.id))] } },
  });
  const byId = new Map(products.map((product: { id: number }) => [product.id, product]));

  return [...merged.values()].map(({ id, size, quantity }) => {
    const product = byId.get(id) as AccessoryProduct | undefined;
    if (!product || product.main_category !== "accessories") {
      throw new Error("До замовлення на пошиття можна додати лише аксесуари.");
    }
    if (!isValidAccessorySize(product, size)) {
      throw new Error("Оберіть розмір аксесуара.");
    }
    const priceUah = Number(product.price);
    if (!Number.isFinite(priceUah) || priceUah < 0) {
      throw new Error("Не вдалося визначити ціну аксесуара.");
    }
    return { productId: id, name: product.name, quantity, priceUah, size };
  });
};

export const createOrder = async (payload: OrderPayload) => {
  if (!payload.items || !Array.isArray(payload.items)) {
    throw new Error(
      "Тіло замовлення не містить масиву товарів (items) або він пустий.",
    );
  }

  const transaction = await db.sequelize.transaction();
  try {
    const customMeasurements =
      payload.orderType === "custom" ? payload.measurements : null;

    // Individual tailoring: never trust prices/dates from the browser.
    // Price range, prepayment and start date are recomputed here.
    let customEstimate: Record<string, unknown> | null = null;
    let customTotalFrom: number | null = null;
    let customItems: StoredOrderItem[] | null = null;

    if (payload.orderType === "custom") {
      const catalogLines: TailoringLine[] =
        Array.isArray(payload.tailoringLines) && payload.tailoringLines.length > 0
          ? payload.tailoringLines.flatMap((line) => {
              const productId = line.productId;
              if (!productId || !getTailoringProduct(productId)) return [];
              return [
                {
                  productId,
                  quantity: clampLineQty(line.quantity ?? 1),
                },
              ];
            })
          : [];

      const tailoringTypes = payload.tailoringTypes;
      const validTypes =
        Array.isArray(tailoringTypes) &&
        tailoringTypes.length > 0 &&
        tailoringTypes.every((type) => type in TAILORING_GARMENTS);
      if ((!validTypes || !tailoringTypes) && catalogLines.length === 0) {
        throw new Error("Для індивідуального пошиву потрібно обрати вироби.");
      }

      const catalogLeadDays = (await loadCatalogLeadDays())?.byProductId ?? null;

      if (catalogLines.length > 0) {
        const baseEstimate = calcTailoringLinesEstimate(
          catalogLines,
          "UAH",
          null,
          catalogLeadDays,
        );
        const totalWorkDays = baseEstimate.leadDaysMin;
        const availability = await getAvailability({
          windowDays: Math.ceil(baseEstimate.leadDaysMin),
          workDays: totalWorkDays,
        });
        const preferred = payload.preferredStartDate;
        const preferredOk =
          !!preferred &&
          preferred >= todayISO() &&
          preferred <= addDaysISO(todayISO(), 600) &&
          canStartOn(
            availability.ranges,
            preferred,
            Math.ceil(baseEstimate.leadDaysMin),
            totalWorkDays,
          );
        const estimate = calcTailoringLinesEstimate(
          catalogLines,
          "UAH",
          preferredOk ? preferred : availability.nearestStart,
          catalogLeadDays,
        );

        customTotalFrom = estimate.priceFrom;
        customItems = catalogLines.map((line) => {
          const p = getTailoringProduct(line.productId)!;
          return {
            name: `Індивідуальний пошив: ${line.productId}`,
            quantity: clampLineQty(line.quantity),
            price: p.priceFromUah,
          };
        });
        customEstimate = {
          lines: catalogLines,
          catalogLeadDays,
          category: payload.tailoringCategory ?? null,
          orderProgram: payload.tailoringOrderProgram ?? null,
          types: tailoringTypes ?? [],
          quantities: payload.tailoringQuantities ?? {},
          programs: payload.tailoringPrograms ?? {},
          priceFromUah: estimate.priceFrom,
          priceToUah: estimate.priceTo,
          prepaymentFromUah: estimate.prepaymentFrom,
          prepaymentToUah: estimate.prepaymentTo,
          leadDaysMin: estimate.leadDaysMin,
          leadDaysMax: estimate.leadDaysMax,
          startDate: estimate.startDate,
          readyFrom: estimate.readyFrom,
          readyTo: estimate.readyTo,
          measurementsPending: isFarOrder(estimate.startDate),
        };
      } else if (tailoringTypes) {

      const quantities = Object.fromEntries(
        tailoringTypes.map((type) => [
          type,
          type === "suit"
            ? 1
            : clampGarmentQty(payload.tailoringQuantities?.[type]),
        ]),
      ) as Partial<Record<MeasurementType, number>>;

      const expandedTypes = expandTailoringTypes(tailoringTypes, quantities);

      // Dance program per garment (ST/LAT); default ST. Only for selected types.
      const programs = Object.fromEntries(
        tailoringTypes.map((type) => [
          type,
          payload.tailoringPrograms?.[type] === "LAT" ? "LAT" : "ST",
        ]),
      );

      // Real production time (working days) from the Notion price list, if known
      const table = await getWorkDaysTable().catch(() => null);
      const workDays = pickWorkDays(
        table,
        tailoringTypes,
        programs as Partial<Record<MeasurementType, TailoringProgram>>,
      );
      const baseEstimate = calcTailoringEstimate(expandedTypes, "UAH", null, workDays);

      // Start = first window in the calendar that fits the whole order
      const availability = await getAvailability({
        windowDays: Math.ceil(baseEstimate.leadDaysMin),
        workDays: sumWorkDaysForSelection(
          table,
          tailoringTypes,
          programs as Partial<Record<MeasurementType, TailoringProgram>>,
          quantities,
        ),
      });

      // The client may pick their own start date in the calendar — accept it
      // only if it is still free for the whole order; otherwise use the nearest.
      const preferred = payload.preferredStartDate;
      const preferredOk =
        !!preferred &&
        preferred >= todayISO() &&
        preferred <= addDaysISO(todayISO(), 600) &&
        canStartOn(
          availability.ranges,
          preferred,
          Math.ceil(baseEstimate.leadDaysMin),
          sumWorkDaysForSelection(
            table,
            tailoringTypes,
            programs as Partial<Record<MeasurementType, TailoringProgram>>,
            quantities,
          ),
        );
      const estimate = calcTailoringEstimate(
        expandedTypes,
        "UAH",
        preferredOk ? preferred : availability.nearestStart,
        workDays,
      );

      customTotalFrom = estimate.priceFrom;
      customItems = tailoringTypes.map((type) => ({
        name: `Індивідуальний пошив: ${type}`,
        quantity: quantities[type] ?? 1,
        price: TAILORING_GARMENTS[type].priceFromUah,
      }));
      customEstimate = {
        types: tailoringTypes,
        quantities,
        programs,
        workDays,
        priceFromUah: estimate.priceFrom,
        priceToUah: estimate.priceTo,
        prepaymentFromUah: estimate.prepaymentFrom,
        prepaymentToUah: estimate.prepaymentTo,
        leadDaysMin: estimate.leadDaysMin,
        leadDaysMax: estimate.leadDaysMax,
        startDate: estimate.startDate,
        readyFrom: estimate.readyFrom,
        readyTo: estimate.readyTo,
        // A booking for the future: fresh measurements are requested ~30 days
        // before the start (cabinet form), whatever was sent now is preliminary.
        measurementsPending: isFarOrder(estimate.startDate),
      };
      }

      const readyAccessories = await resolveReadyAccessories(
        payload.readyAccessories,
      );
      if (readyAccessories.length > 0) {
        const extrasTotal = readyAccessories.reduce(
          (sum, item) => sum + item.priceUah * item.quantity,
          0,
        );
        customTotalFrom = (customTotalFrom ?? 0) + extrasTotal;
        customItems = [
          ...(customItems ?? []),
          ...readyAccessories.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.priceUah,
            productId: String(item.productId),
            color: null,
            size: item.size ? formatAccessorySize(item.size, "uk") : null,
            isAccessory: true,
          })),
        ];
        const prev = customEstimate ?? {};
        customEstimate = {
          ...prev,
          readyAccessories,
          accessoriesTotalUah: extrasTotal,
          priceFromUah: Number(prev.priceFromUah ?? 0) + extrasTotal,
          priceToUah: Number(prev.priceToUah ?? 0) + extrasTotal,
          prepaymentFromUah: Number(prev.prepaymentFromUah ?? 0) + extrasTotal,
          prepaymentToUah: Number(prev.prepaymentToUah ?? 0) + extrasTotal,
        };
      }

      const refs = payload.referenceImageUrls;
      if (
        customEstimate &&
        Array.isArray(refs) &&
        refs.length > 0
      ) {
        const safe = refs
          .filter(
            (u): u is string =>
              typeof u === "string" &&
              /^https:\/\/res\.cloudinary\.com\//i.test(u),
          )
          .slice(0, 5);
        if (safe.length > 0) {
          customEstimate = { ...customEstimate, referenceImageUrls: safe };
        }
      }
    }

    const grossTotalUah =
      customTotalFrom ??
      payload.items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0,
      );

    let certificateCode: string | null = null;
    let certificateDiscountUah: number | null = null;
    let lockedCertificate: Awaited<
      ReturnType<typeof lockCertificateForRedemption>
    > | null = null;

    if (payload.certificateCode?.trim()) {
      lockedCertificate = await lockCertificateForRedemption(
        payload.certificateCode.trim(),
        transaction,
      );
      const certAmount = Number(lockedCertificate.amountUah);
      certificateDiscountUah = computeCertificateDiscount(
        certAmount,
        grossTotalUah,
      );
      if (certificateDiscountUah <= 0) {
        throw new Error(
          "Сума замовлення замала для застосування сертифіката.",
        );
      }
      certificateCode =
        lockedCertificate.electronicCode ??
        String(lockedCertificate.number);
      if (customEstimate && typeof customEstimate === "object") {
        customEstimate = {
          ...customEstimate,
          certificateCode,
          certificateDiscountUah,
        };
      }
    }

    const netTotalUah = Math.max(
      0,
      grossTotalUah - (certificateDiscountUah ?? 0),
    );

    const fullyCoveredByCertificate =
      Boolean(certificateCode) && netTotalUah <= 0;

    if (fullyCoveredByCertificate && customEstimate && typeof customEstimate === "object") {
      customEstimate = {
        ...customEstimate,
        fullyCoveredByCertificate: true,
        certificateCoversAll: true,
        prepaymentDueUah: 0,
      };
    }

    const order = await db.Order.create(
      {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        email: payload.email,
        deliveryMethod: payload.deliveryMethod,
        city:
          payload.deliveryMethod === "nova_poshta" ||
          payload.deliveryMethod === "ukrposhta"
            ? (payload.city ?? null)
            : null,
        warehouse:
          payload.deliveryMethod === "nova_poshta" ||
          payload.deliveryMethod === "ukrposhta"
            ? (payload.warehouse ?? null)
            : null,
        paymentMethod: payload.paymentMethod,
        totalAmount: netTotalUah,
        status: fullyCoveredByCertificate ? "confirmed" : "pending",
        orderType: payload.orderType,
        communicationMethod: payload.communicationMethod,
        socialUsername: payload.socialUsername,
        comment: payload.comment?.trim() || null,
        estimate: customEstimate,
        certificateCode,
        certificateDiscountUah,
        // Secret link to the client cabinet (individual tailoring only)
        accessToken: payload.orderType === "custom" ? generateAccessToken() : null,
      },
      { transaction },
    );

    if (lockedCertificate && certificateDiscountUah != null) {
      await redeemCertificateForOrder({
        cert: lockedCertificate,
        orderId: order.id,
        discountUah: certificateDiscountUah,
        clientName: `${payload.lastName} ${payload.firstName}`,
        transaction,
      });
    }

    const orderItemsData = (customItems ?? payload.items).map((item) => ({
      orderId: order.id,
      productId:
        "productId" in item && item.productId ? Number(item.productId) : null,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      color: ("color" in item && item.color) || null,
      size: ("size" in item && item.size) || null,
      measurements:
        "isAccessory" in item && item.isAccessory ? null : customMeasurements,
    }));

    await db.OrderItem.bulkCreate(orderItemsData, { transaction });

    await transaction.commit();

    try {
      const fullOrder = await getOrderById(order.id);

      if (fullOrder) {
        const orderForNotifications = {
          ...fullOrder.toJSON(),
          displayCurrency: payload.displayCurrency ?? "UAH",
        };

        // Менеджеру в Telegram
        void sendTelegramNotification(orderForNotifications);

        // Клієнту на email (Resend)
        void sendOrderConfirmationEmail(orderForNotifications);

        // У Notion (тільки індивідуальний пошив). Не блокує відповідь клієнту:
        // якщо Notion недоступний — менеджер отримає попередження в Telegram.
        if (fullOrder.orderType === "custom") {
          const shortId = String(fullOrder.id).split("-")[0].toUpperCase();
          void createNotionOrder(orderForNotifications)
            .then(async (created) => {
              // Remember the Notion page → live status in the client cabinet
              if (created?.id && created.id !== "dry-run-page-id") {
                await db.Order.update(
                  { notionPageId: created.id },
                  { where: { id: fullOrder.id } },
                ).catch((e: unknown) =>
                  console.error("❌ Не вдалося зберегти notionPageId:", e),
                );
              }
            })
            .catch((error) => {
            console.error("❌ Не вдалося створити замовлення в Notion:", error);
            void sendTelegramText(
              `⚠️ Замовлення №${shortId} не потрапило в Notion (${error instanceof Error ? error.message.slice(0, 150) : "помилка"}). Додайте його вручну.`,
            );
          });
        }
      }
    } catch (notifyError) {
      console.error("Помилка відправки сповіщень:", notifyError);
    }

    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getOrders = async () => {
  return await db.Order.findAll({
    include: [{ model: db.OrderItem, as: "items" }],
    order: [["createdAt", "DESC"]],
  });
};

export const getOrderById = async (id: string) => {
  return await db.Order.findByPk(id, {
    include: [{ model: db.OrderItem, as: "items" }],
  });
};
