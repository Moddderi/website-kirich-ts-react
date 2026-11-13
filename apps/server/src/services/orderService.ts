import {
  TAILORING_GARMENTS,
  addDaysISO,
  calcTailoringEstimate,
  canStartOn,
  isFarOrder,
  pickWorkDays,
  sumWorkDays,
  todayISO,
  type MeasurementType,
  type OrderPayload,
  type TailoringProgram,
} from "@project/shared";
import db from "../models/index.js";
import { getAvailability } from "../utils/availability.js";
import {
  sendTelegramNotification,
  sendTelegramText,
} from "../utils/telegram.js";
import { createNotionOrder, getWorkDaysTable } from "../utils/notionOrders.js";
import { generateAccessToken } from "../utils/cabinet.js";
import { sendOrderConfirmationEmail } from "../utils/email.js";

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
    let customItems: Array<{
      name: string;
      quantity: number;
      price: number;
    }> | null = null;

    if (payload.orderType === "custom") {
      const tailoringTypes = payload.tailoringTypes;
      const validTypes =
        Array.isArray(tailoringTypes) &&
        tailoringTypes.length > 0 &&
        tailoringTypes.every((type) => type in TAILORING_GARMENTS);
      if (!validTypes || !tailoringTypes) {
        throw new Error("Для індивідуального пошиву потрібно обрати вироби.");
      }

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
      const baseEstimate = calcTailoringEstimate(tailoringTypes, "UAH", null, workDays);

      // Start = first window in the calendar that fits the whole order
      const availability = await getAvailability({
        windowDays: Math.ceil(baseEstimate.leadDaysMin),
        workDays: sumWorkDays(workDays),
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
          sumWorkDays(workDays),
        );
      const estimate = calcTailoringEstimate(
        tailoringTypes,
        "UAH",
        preferredOk ? preferred : availability.nearestStart,
        workDays,
      );

      customTotalFrom = estimate.priceFrom;
      customItems = tailoringTypes.map((type) => ({
        name: `Індивідуальний пошив: ${type}`,
        quantity: 1,
        price: TAILORING_GARMENTS[type].priceFromUah,
      }));
      customEstimate = {
        types: tailoringTypes,
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
        totalAmount: customTotalFrom ?? payload.totalAmount,
        status: "pending",
        orderType: payload.orderType,
        communicationMethod: payload.communicationMethod,
        socialUsername: payload.socialUsername,
        comment: payload.comment?.trim() || null,
        estimate: customEstimate,
        // Secret link to the client cabinet (individual tailoring only)
        accessToken: payload.orderType === "custom" ? generateAccessToken() : null,
      },
      { transaction },
    );

    const orderItemsData = (customItems ?? payload.items).map((item) => ({
      orderId: order.id,
      productId:
        "productId" in item && item.productId ? Number(item.productId) : null,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      color: ("color" in item && item.color) || null,
      size: ("size" in item && item.size) || null,
      measurements: customMeasurements,
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
