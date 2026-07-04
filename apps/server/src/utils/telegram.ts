import dotenv from "dotenv";
dotenv.config();

import {
  MEASUREMENTS_CATALOG,
  MEASUREMENT_UNIT_LABELS,
  type MeasurementUnit,
} from "@project/shared";

type MeasurementsPayload =
  | Record<string, string>
  | {
      unit?: MeasurementUnit;
      values?: Record<string, string>;
    };

const parseMeasurementsPayload = (measurementsData: unknown): { unit: MeasurementUnit; values: Record<string, string> } => {
  if (!measurementsData) {
    return { unit: "cm", values: {} };
  }

  let data: any = measurementsData;

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return { unit: "cm", values: {} };
    }
  }

  if (typeof data !== "object" || data === null) {
    return { unit: "cm", values: {} };
  }

  if ("unit" in data && "values" in data && typeof data.values === "object" && data.values !== null) {
    const values: Record<string, string> = {};
    for (const [k, v] of Object.entries(data.values)) {
      values[k] = String(v);
    }
    return {
      unit: (data.unit === "in" || data.unit === "cm") ? data.unit : "cm",
      values,
    };
  }

  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string" || typeof v === "number") {
      values[k] = String(v);
    }
  }
  return { unit: "cm", values };
};

/**
 * Функція для відправки сповіщення в Telegram-чат менеджерів
 */
export const sendTelegramNotification = async (order: any) => {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "⚠️ В .env не знайдено TELEGRAM_TOKEN або TELEGRAM_CHAT_ID. Пропускаю відправку.",
    );
    return;
  }

  const isCustomOrder = order.orderType === "custom";

  let itemsList = "";
  if (isCustomOrder) {
    itemsList = `• 🧵 *Індивідуальний пошив*\n`;

    const customItem = order.items?.[0];
    const measurementsData = customItem?.measurements;

    let measurementsObj: Record<string, string> = {};
    let measurementUnit: MeasurementUnit = "cm";

    try {
      const parsedMeasurements = parseMeasurementsPayload(measurementsData);
      measurementsObj = parsedMeasurements.values;
      measurementUnit = parsedMeasurements.unit;
    } catch (e) {
      console.error("❌ Не вдалося розпарсити мірки для Telegram:", e);
    }

    const unitLabel = MEASUREMENT_UNIT_LABELS[measurementUnit];

    if (measurementsObj && Object.keys(measurementsObj).length > 0) {
      itemsList +=
        `  *Одиниці виміру:* ${unitLabel}\n` +
        `  *Усі мірки клієнта:*\n` +
        Object.entries(measurementsObj)
          .filter(([key]) => key !== "waist_definition")
          .map(([key, value]) => {
            const measurementInfo =
              MEASUREMENTS_CATALOG[key as keyof typeof MEASUREMENTS_CATALOG];
            const nameUkr = measurementInfo ? measurementInfo.name : key;

            return `  - *${nameUkr}:* ${value} ${unitLabel}`;
          })
          .join("\n");
    } else {
      itemsList += `  _Мірки будуть уточнені менеджером особисто_`;
    }
  } else if (order.items && order.items.length > 0) {
    itemsList = order.items
      .map((item: any) => {
        const details = [
          item.size ? `Розмір: ${item.size}` : null,
          item.color ? `Колір: ${item.color}` : null,
        ]
          .filter(Boolean)
          .join(", ");

        const detailsStr = details ? ` (${details})` : "";

        return `• 🛍️ *${item.name}*${detailsStr}\n  _${item.quantity} шт. х ${parseFloat(item.price).toLocaleString()} ₴_`;
      })
      .join("\n");
  } else {
    itemsList = "Товари не знайдено";
  }

  const cleanValue = order.socialUsername
    ? order.socialUsername.replace("@", "").trim()
    : "";

  let clientSocialLink = "";
  if (order.communicationMethod === "telegram") {
    clientSocialLink = `[Написати в Telegram](https://t.me/${cleanValue})`;
  } else if (order.communicationMethod === "instagram") {
    clientSocialLink = `[Відкрити Instagram](https://instagram.com/${cleanValue})`;
  } else if (order.communicationMethod === "whatsapp") {
    const cleanPhone = cleanValue.replace(/[^+\d]/g, "");
    clientSocialLink = `[Написати в WhatsApp](https://wa.me/${cleanPhone})`;
  }

  const orderIdPrefix = order.id
    ? order.id.split("-")[0].toUpperCase()
    : "CUSTOM";

  const message = `
🔥 *${isCustomOrder ? "НОВИЙ ЗАПИТ НА ПОШИВ" : "НОВЕ ЗАМОВЛЕННЯ"} № ${orderIdPrefix}* 🔥
---
👤 *Клієнт:* ${order.firstName} ${order.lastName}
📞 *Телефон:* ${order.phone}
📧 *Email:* ${order.email}

💬 *Зв'язок:* ${order.communicationMethod ? order.communicationMethod.toUpperCase() : "НЕ ВКАЗАНО"}
🔗 *Контакт клієнта:* ${cleanValue ? clientSocialLink : "Дані не вказані"}

📦 *Доставка:* ${
    order.deliveryMethod === "nova_poshta"
      ? `🚚 Нова Пошта\n📍 *Місто:* ${order.city}\n🏢 *Відділення:* ${order.warehouse}`
      : "🏪 Самовивіз із студії в Києві"
  }
💳 *Оплата:* ${order.paymentMethod === "online" ? "💳 Онлайн (Передоплата)" : "💵 Накладений платіж"}

📋 *Деталі замовлення:*
${itemsList}

---
💰 *Всього до сплати:* *${
    isCustomOrder
      ? "Розраховується менеджером"
      : `${parseFloat(order.totalAmount).toLocaleString()} ₴`
  }*
`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Помилка від Telegram API:", errorData);
    }
  } catch (error) {
    console.error("❌ Не вдалося відправити сповіщення в Telegram:", error);
  }
};
