import { sendTelegramText } from "./telegram.js";
import { sendMeasurementsReminderEmail } from "./email.js";
import { cabinetUrl } from "./links.js";

/** Notifies the studio (Telegram) and the client (e-mail, if Resend works). */
export const notifyMeasurementsRequested = async (order: any) => {
  const name = `${order.lastName} ${order.firstName}`.trim();
  const contact = order.socialUsername
    ? `${String(order.communicationMethod ?? "").toUpperCase()} ${order.socialUsername}`
    : order.phone;
  const link = order.accessToken ? cabinetUrl(order.accessToken) : "";

  await sendTelegramText(
    `✂️ Час зняти мірки: ${name}\n` +
      `Контакт: ${contact} · ${order.phone}\n` +
      (link
        ? `Кабінет клієнта (бланк мірок відкрито): ${link}\n`
        : "") +
      `Статус у Notion змінено на «Планове зняття мірок». Нагадайте клієнту в його месенджері.`,
  );

  await sendMeasurementsReminderEmail(order);
};
