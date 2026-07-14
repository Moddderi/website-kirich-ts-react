import { Resend } from "resend";
import {
  MEASUREMENT_LABELS_UK,
  MEASUREMENT_CONFIG,
  MEASUREMENT_UNIT_LABELS,
  formatPrice,
  isCurrency,
  type Currency,
  type MeasurementType,
  type MeasurementUnit,
} from "@project/shared";

type MeasurementsPayload =
  | Record<string, string>
  | {
      unit?: MeasurementUnit;
      values?: Record<string, string>;
    };

const parseMeasurementsPayload = (
  measurementsData: unknown,
): { unit: MeasurementUnit; values: Record<string, string> } => {
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

  if (
    "unit" in data &&
    "values" in data &&
    typeof data.values === "object" &&
    data.values !== null
  ) {
    const values: Record<string, string> = {};
    for (const [k, v] of Object.entries(data.values)) {
      values[k] = String(v);
    }
    return {
      unit: data.unit === "in" || data.unit === "cm" ? data.unit : "cm",
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

const getDisplayCurrency = (order: { displayCurrency?: unknown }): Currency =>
  isCurrency(order.displayCurrency) ? order.displayCurrency : "UAH";

const getOrderIdShort = (orderId?: string) =>
  orderId ? orderId.split("-")[0].toUpperCase() : "CUSTOM";

const getTailoringTypeLabel = (
  customItem: { name?: string } | undefined,
): string => {
  const name = customItem?.name ?? "";
  const typeMatch = name.match(/:\s*([^:]+)$/);
  const typeKey = typeMatch?.[1]?.trim();

  if (typeKey && typeKey in MEASUREMENT_CONFIG) {
    return MEASUREMENT_CONFIG[typeKey as MeasurementType].label;
  }

  return typeKey || "Не вказано";
};

const getCommunicationLabel = (method?: string | null) => {
  switch (method) {
    case "telegram":
      return "Telegram";
    case "instagram":
      return "Instagram";
    case "whatsapp":
      return "WhatsApp";
    default:
      return "Не вказано";
  }
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getDeliveryCarrierLabel = (method: string) => {
  if (method === "ukrposhta") return "Укрпошта";
  if (method === "nova_poshta") return "Нова Пошта";
  return null;
};

const getDeliveryHtml = (order: any) => {
  const carrier = getDeliveryCarrierLabel(order.deliveryMethod);
  if (carrier) {
    return `
      <p style="margin:0 0 6px;"><strong>Доставка:</strong> ${carrier}</p>
      <p style="margin:0 0 6px;"><strong>Місто:</strong> ${escapeHtml(order.city || "—")}</p>
      <p style="margin:0;"><strong>Відділення:</strong> ${escapeHtml(order.warehouse || "—")}</p>
    `;
  }

  return `<p style="margin:0;"><strong>Доставка:</strong> Самовивіз із студії</p>`;
};

const emailShell = (title: string, bodyHtml: string) => `
<!DOCTYPE html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f1eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,sans-serif;color:#1c1917;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f1eb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e7e5e4;">
            <tr>
              <td style="background:#1c1917;padding:28px 32px;text-align:center;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#a8a29e;">K.I.RICH SEWING STUDIO</p>
                <h1 style="margin:0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:600;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid #f5f5f4;text-align:center;">
                <p style="margin:0;font-size:12px;color:#78716c;line-height:1.5;">
                  Якщо у вас є питання — просто дайте відповідь на цей лист<br />
                  або напишіть на
                  <a href="mailto:kirich.sewing.studio@gmail.com" style="color:#1c1917;">kirich.sewing.studio@gmail.com</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const buildReadyMadeEmailHtml = (order: any) => {
  const displayCurrency = getDisplayCurrency(order);
  const orderIdShort = getOrderIdShort(order.id);

  const itemsHtml = (order.items || [])
    .map((item: any) => {
      const details = [
        item.size ? `Розмір: ${escapeHtml(String(item.size))}` : null,
        item.color ? `Колір: ${escapeHtml(String(item.color))}` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f5f5f4;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1c1917;">
              ${escapeHtml(item.name || "Товар")} × ${item.quantity}
            </p>
            ${details ? `<p style="margin:0 0 4px;font-size:12px;color:#78716c;">${details}</p>` : ""}
            <p style="margin:0;font-size:13px;color:#1c1917;">
              ${formatPrice(Number(item.price) * Number(item.quantity), displayCurrency)}
            </p>
          </td>
        </tr>
      `;
    })
    .join("");

  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
      Вітаємо, <strong>${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}</strong>!
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#57534e;">
      Ваше замовлення <strong>№ ${orderIdShort}</strong> успішно прийнято.
      Найближчим часом менеджер зв’яжеться з вами через
      <strong>${getCommunicationLabel(order.communicationMethod)}</strong>
      ${order.socialUsername ? `(${escapeHtml(String(order.socialUsername))})` : ""}.
    </p>

    <h2 style="margin:0 0 12px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#78716c;">Деталі замовлення</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${itemsHtml}
    </table>

    <div style="margin-top:20px;padding:16px;border-radius:16px;background:#fafaf9;">
      ${getDeliveryHtml(order)}
      <p style="margin:12px 0 0;font-size:16px;">
        <strong>Всього:</strong> ${formatPrice(Number(order.totalAmount), displayCurrency)}
      </p>
    </div>
  `;

  return emailShell(`Замовлення № ${orderIdShort} підтверджено`, body);
};

const buildCustomOrderEmailHtml = (order: any) => {
  const orderIdShort = getOrderIdShort(order.id);
  const customItem = order.items?.[0];
  const tailoringTypeLabel = getTailoringTypeLabel(customItem);

  let measurementsHtml = `
    <p style="margin:0;font-size:13px;color:#78716c;">
      Мірки будуть уточнені менеджером особисто.
    </p>
  `;

  try {
    const parsed = parseMeasurementsPayload(customItem?.measurements);
    const unitLabel = MEASUREMENT_UNIT_LABELS[parsed.unit];
    const entries = Object.entries(parsed.values).filter(
      ([key]) => key !== "waist_definition",
    );

    if (entries.length > 0) {
      measurementsHtml = `
        <p style="margin:0 0 10px;font-size:13px;color:#57534e;">
          <strong>Одиниці виміру:</strong> ${unitLabel}
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${entries
            .map(([key, value]) => {
              const label =
                MEASUREMENT_LABELS_UK[
                  key as keyof typeof MEASUREMENT_LABELS_UK
                ] ?? key;
              return `
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f5f5f4;font-size:13px;color:#57534e;">
                    ${escapeHtml(label)}
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid #f5f5f4;font-size:13px;color:#1c1917;text-align:right;font-weight:600;">
                    ${escapeHtml(String(value))} ${unitLabel}
                  </td>
                </tr>
              `;
            })
            .join("")}
        </table>
      `;
    }
  } catch (error) {
    console.error("❌ Не вдалося розпарсити мірки для email:", error);
  }

  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
      Вітаємо, <strong>${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}</strong>!
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#57534e;">
      Ваш запит на індивідуальне пошиття <strong>№ ${orderIdShort}</strong> успішно прийнято.
      Менеджер зв’яжеться з вами через
      <strong>${getCommunicationLabel(order.communicationMethod)}</strong>
      ${order.socialUsername ? `(${escapeHtml(String(order.socialUsername))})` : ""}
      для уточнення деталей і вартості.
    </p>

    <div style="margin:0 0 20px;padding:16px;border-radius:16px;background:#fafaf9;">
      <p style="margin:0 0 6px;"><strong>Тип виробу:</strong> ${escapeHtml(tailoringTypeLabel)}</p>
      ${getDeliveryHtml(order)}
      <p style="margin:12px 0 0;"><strong>Вартість:</strong> розраховується менеджером</p>
    </div>

    <h2 style="margin:0 0 12px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#78716c;">Ваші мірки</h2>
    ${measurementsHtml}
  `;

  return emailShell(`Запит на пошиття № ${orderIdShort} прийнято`, body);
};

/**
 * Відправляє клієнту лист-підтвердження замовлення через Resend.
 * Не кидає помилку назовні — замовлення вже збережене в БД.
 */
export const sendOrderConfirmationEmail = async (order: any) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM || "K.I.RICH <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(
      "⚠️ В .env не знайдено RESEND_API_KEY. Пропускаю відправку email.",
    );
    return;
  }

  if (!order?.email) {
    console.warn("⚠️ У замовленні немає email. Пропускаю відправку.");
    return;
  }

  const isCustomOrder = order.orderType === "custom";
  const orderIdShort = getOrderIdShort(order.id);
  const subject = isCustomOrder
    ? `K.I.RICH — запит на пошиття № ${orderIdShort}`
    : `K.I.RICH — замовлення № ${orderIdShort} підтверджено`;

  const html = isCustomOrder
    ? buildCustomOrderEmailHtml(order)
    : buildReadyMadeEmailHtml(order);

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [order.email],
      subject,
      html,
      replyTo: process.env.EMAIL_REPLY_TO || "kirich.sewing.studio@gmail.com",
    });

    if (error) {
      console.error("❌ Помилка Resend API:", error);
      return;
    }

    console.log("✅ Email підтвердження відправлено:", data?.id);
  } catch (error) {
    console.error("❌ Не вдалося відправити email підтвердження:", error);
  }
};
