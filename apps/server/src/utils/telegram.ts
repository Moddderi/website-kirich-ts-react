import dotenv from "dotenv";
dotenv.config();

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

  // 1. Форматуємо список товарів у гарний список із буллетами (додано код товару)
  const itemsList =
    order.items && order.items.length > 0
      ? order.items
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
          .join("\n")
      : "Товари не знайдено";

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
    // Убираем все нечисловые символы для ссылки на WhatsApp (оставляем только плюс и цифры)
    const cleanPhone = cleanValue.replace(/[^+\d]/g, "");
    clientSocialLink = `[Написати в WhatsApp](https://wa.me/${cleanPhone})`;
  }

  // 3. Збираємо шаблон повідомлення українською мовою
  const message = `
🔥 *НОВЕ ЗАМОВЛЕННЯ № ${order.id.split("-")[0].toUpperCase()}* 🔥
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

📋 *Товари:*
${itemsList}

---
💰 *Всього до сплати:* *${parseFloat(order.totalAmount).toLocaleString()} ₴*
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
          parse_mode: "Markdown", // Щоб працював жирний текст та посилання []()
          disable_web_page_preview: true, // Щоб не генерувалося прев'ю месенджерів під текстом
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
