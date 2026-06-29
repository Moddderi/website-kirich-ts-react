import dotenv from "dotenv";
dotenv.config();

// Імпортуємо ваш каталог мірок, де прописані назви українською (name)
import { MEASUREMENTS_CATALOG } from "@project/shared"; // ⚠️ Вкажіть правильний шлях до файлу каталогу

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

  // Визначаємо тип замовлення
  const isCustomOrder = order.orderType === "custom";

  // 1. Форматуємо список товарів або мірки для пошиття
  let itemsList = "";
  if (isCustomOrder) {
    itemsList = `• 🧵 *Індивідуальний пошив*\n`;

    // Дістаємо мірки з масиву items (з першого елемента)
    const customItem = order.items?.[0];
    const measurementsData = customItem?.measurements;

    // Безпечний парсинг на випадок, якщо вони прийдуть як рядок JSON з бази
    let measurementsObj = null;
    try {
      measurementsObj =
        typeof measurementsData === "string"
          ? JSON.parse(measurementsData)
          : measurementsData;
    } catch (e) {
      console.error("❌ Не вдалося розпарсити мірки для Telegram:", e);
    }

    if (measurementsObj && Object.keys(measurementsObj).length > 0) {
      itemsList +=
        `  *Усі мірки клієнта:*\n` +
        Object.entries(measurementsObj)
          .map(([key, value]) => {
            // Отримуємо назву мірки з вашого каталогу MEASUREMENTS_CATALOG,
            // якщо її там немає (наприклад, кастомний ключ) — залишаємо оригінальний ключ
            const measurementInfo =
              MEASUREMENTS_CATALOG[key as keyof typeof MEASUREMENTS_CATALOG];
            const nameUkr = measurementInfo ? measurementInfo.name : key;

            return `  - *${nameUkr}:* ${value} см`;
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

  // 2. Очищаємо нікнейм/телефон від зайвих символів, якщо користувач його ввів
  const cleanValue = order.socialUsername
    ? order.socialUsername.replace("@", "").trim()
    : "";

  // Створюємо клікабельне посилання для менеджера з урахуванням WhatsApp
  let clientSocialLink = "";
  if (order.communicationMethod === "telegram") {
    clientSocialLink = `[Написати в Telegram](https://t.me/${cleanValue})`;
  } else if (order.communicationMethod === "instagram") {
    clientSocialLink = `[Відкрити Instagram](https://instagram.com/${cleanValue})`;
  } else if (order.communicationMethod === "whatsapp") {
    const cleanPhone = cleanValue.replace(/[^+\d]/g, "");
    clientSocialLink = `[Написати в WhatsApp](https://wa.me/${cleanPhone})`;
  }

  // 3. Збираємо шаблон повідомлення українською мовою
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

  // 4. Відправляємо POST-запит на API Telegram
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
