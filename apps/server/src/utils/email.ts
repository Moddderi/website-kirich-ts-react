import { Resend } from "resend";
import {
  MEASUREMENT_LABELS_UK,
  MEASUREMENT_UNIT_LABELS,
  convertCartTotalFromUah,
  convertLineFromUah,
  formatConvertedPrice,
  isCurrency,
  type Currency,
  type MeasurementType,
  type MeasurementUnit,
} from "@project/shared";
import { cabinetUrl } from "./links.js";
import { EMAIL_COPY, emailLang, type EmailLang } from "./emailLocale.js";
import { buildCustomOrderSummary } from "./tailoringSummary.js";
import { readReferenceImageUrls } from "./orderReferenceImages.js";

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

const getCommunicationLabel = (method?: string | null, lang: EmailLang = "uk") => {
  const en = lang === "en";
  switch (method) {
    case "telegram":
      return "Telegram";
    case "instagram":
      return "Instagram";
    case "whatsapp":
      return "WhatsApp";
    case "viber":
      return "Viber";
    case "signal":
      return "Signal";
    default:
      return en ? "Not specified" : "Не вказано";
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

const getDeliveryHtml = (order: any, L: (typeof EMAIL_COPY)["uk"]) => {
  const line = (label: string, value: string) =>
    `<p style="margin:0 0 6px;font-size:14px;color:${MUTED};"><strong style="color:${INK};">${label}:</strong> ${value}</p>`;

  const carrier = getDeliveryCarrierLabel(order.deliveryMethod);
  if (carrier) {
    return `
      ${line(L.delivery, carrier)}
      ${line(L.city, escapeHtml(order.city || "—"))}
      <p style="margin:0;font-size:14px;color:${MUTED};"><strong style="color:${INK};">${L.warehouse}:</strong> ${escapeHtml(order.warehouse || "—")}</p>
    `;
  }

  return `<p style="margin:0;font-size:14px;color:${MUTED};"><strong style="color:${INK};">${L.delivery}:</strong> ${L.pickup}</p>`;
};

/** Noir palette, matching the site: near-black surfaces, cool white type, muted ember. */
const INK = "#f4f4f5";
const MUTED = "#a1a1aa";
const FAINT = "#71717a";
const LINE = "#262626";
const PANEL = "#141414";
const ACCENT = "#c4414d";
const CERT_GREEN_BG = "#ecfdf5";
const CERT_GREEN_BORDER = "#6ee7b7";
const CERT_GREEN_INK = "#065f46";
const CERT_GREEN_MUTED = "#047857";
const SERIF = "Georgia,'Times New Roman',serif";

const buildCertificateEmailBanner = (
  order: {
    certificateCode?: string | null;
    certificateDiscountUah?: number | null;
  },
  lang: EmailLang,
) => {
  if (!order.certificateCode || order.certificateDiscountUah == null) return "";
  const code = String(order.certificateCode);
  const displayCode = /^KIR-/.test(code) ? code : `№${code}`;
  const amount = Number(order.certificateDiscountUah).toLocaleString(
    lang === "en" ? "en-GB" : "uk-UA",
  );
  const title = lang === "en" ? "Gift certificate applied" : "Сертифікат застосовано";
  const line =
    lang === "en"
      ? `Discount of ${amount} ₴ applied to your order`
      : `Знижку ${amount} ₴ враховано в замовленні`;
  const codeLabel = lang === "en" ? "Code" : "Код";
  return `<div style="margin:0 0 24px;padding:18px 20px;border-radius:16px;background:${CERT_GREEN_BG};border:1px solid ${CERT_GREEN_BORDER};">
    <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${CERT_GREEN_MUTED};">${title}</p>
    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:${CERT_GREEN_INK};">${escapeHtml(line)}</p>
    <p style="margin:0;font-size:13px;color:${CERT_GREEN_MUTED};">${codeLabel}: <span style="font-family:ui-monospace,monospace;">${escapeHtml(displayCode)}</span></p>
  </div>`;
};

const emailShell = (title: string, bodyHtml: string, lang: EmailLang = "uk") => {
  const L = EMAIL_COPY[lang];
  return `
<!DOCTYPE html>
<html lang="${L.htmlLang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,sans-serif;color:${INK};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#0c0c0c;border-radius:24px;overflow:hidden;border:1px solid ${LINE};">
            <tr>
              <td style="height:3px;background:${ACCENT};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 32px 8px;text-align:center;">
                <p style="margin:0 0 14px;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:${FAINT};">${L.studioTag}</p>
                <h1 style="margin:0;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:500;color:${INK};">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid ${LINE};text-align:center;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${FAINT};">${L.footerCity}</p>
                <p style="margin:0;font-size:12px;color:${FAINT};line-height:1.6;">
                  ${L.footerHelp}
                  <a href="mailto:kirich.sewing.studio@gmail.com" style="color:${ACCENT};text-decoration:none;">kirich.sewing.studio@gmail.com</a>
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
};

const sectionLabel = (text: string) =>
  `<h2 style="margin:0 0 12px;font-size:11px;letter-spacing:0.26em;text-transform:uppercase;color:${FAINT};">${text}</h2>`;

const ctaButton = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;padding:13px 30px;border-radius:999px;background:${ACCENT};color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.04em;text-decoration:none;">${label}</a>`;

const buildReadyMadeEmailHtml = (order: any) => {
  const lang = emailLang(order);
  const L = EMAIL_COPY[lang];
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
          <td style="padding:12px 0;border-bottom:1px solid ${LINE};">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${INK};">
              ${escapeHtml(item.name || "Товар")} × ${item.quantity}
            </p>
            ${details ? `<p style="margin:0 0 4px;font-size:12px;color:${FAINT};">${details}</p>` : ""}
            <p style="margin:0;font-size:13px;color:${INK};">
              ${formatConvertedPrice(
                convertLineFromUah(
                  Number(item.price),
                  Number(item.quantity),
                  displayCurrency,
                ),
                displayCurrency,
              )}
            </p>
          </td>
        </tr>
      `;
    })
    .join("");

  const orderTotal = formatConvertedPrice(
    convertCartTotalFromUah(order.items || [], displayCurrency),
    displayCurrency,
  );

  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${INK};">
      Вітаємо, <strong>${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}</strong>!
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:${MUTED};">
      Ваше замовлення <strong style="color:${INK};">№ ${orderIdShort}</strong> успішно прийнято.
      Найближчим часом менеджер зв’яжеться з вами через
      <strong style="color:${INK};">${getCommunicationLabel(order.communicationMethod)}</strong>
      ${order.socialUsername ? `(${escapeHtml(String(order.socialUsername))})` : ""}.
    </p>

    ${buildCertificateEmailBanner(order, lang)}

    ${sectionLabel("Деталі замовлення")}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${itemsHtml}
    </table>

    <div style="margin-top:20px;padding:16px 18px;border-radius:16px;background:${PANEL};border:1px solid ${LINE};">
      ${getDeliveryHtml(order, L)}
      <p style="margin:14px 0 0;padding-top:12px;border-top:1px solid ${LINE};font-size:16px;color:${INK};">
        <strong>${L.total}:</strong> <span style="color:${ACCENT};">${orderTotal}</span>
      </p>
    </div>
  `;

  return emailShell(L.readySubject(orderIdShort), body, lang);
};

const buildCustomOrderEmailHtml = (order: any) => {
  const lang = emailLang(order);
  const L = EMAIL_COPY[lang];
  const orderIdShort = getOrderIdShort(order.id);
  const customItem = order.items?.[0];
  const summary = buildCustomOrderSummary(order);
  const social = order.socialUsername
    ? ` (${escapeHtml(String(order.socialUsername))})`
    : "";

  let measurementsHtml = `
    <p style="margin:0;font-size:13px;color:${FAINT};">
      ${
        order.estimate?.measurementsPending
          ? L.measurementsPending
          : L.measurementsManager
      }
    </p>
  `;

  try {
    const parsed = parseMeasurementsPayload(customItem?.measurements);
    const unitLabel = MEASUREMENT_UNIT_LABELS[parsed.unit];
    const entries = Object.entries(parsed.values).filter(
      ([key]) => key !== "waist_definition",
    );

    if (entries.length > 0 && !order.estimate?.measurementsPending) {
      measurementsHtml = `
        <p style="margin:0 0 10px;font-size:13px;color:${MUTED};">
          <strong style="color:${INK};">${L.units}:</strong> ${unitLabel}
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
                  <td style="padding:8px 0;border-bottom:1px solid ${LINE};font-size:13px;color:${MUTED};">
                    ${escapeHtml(label)}
                  </td>
                  <td style="padding:8px 0;border-bottom:1px solid ${LINE};font-size:13px;color:${INK};text-align:right;font-weight:600;">
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

  const garmentsHtml = summary.lines
    .map(
      (line) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};">
          <strong>${escapeHtml(line.label)}</strong>
          <span style="display:block;font-size:12px;color:${FAINT};">${escapeHtml(line.category)} · ${escapeHtml(line.leadDays)}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:13px;color:${ACCENT};text-align:right;font-weight:600;white-space:nowrap;">
          ${escapeHtml(line.priceRange)}
        </td>
      </tr>`,
    )
    .join("");

  const summaryLine = (label: string, value: string, last = false) =>
    `<p style="margin:0 0 ${last ? 0 : 6}px;font-size:14px;color:${MUTED};"><strong style="color:${INK};">${label}:</strong> ${value}</p>`;

  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${INK};">
      ${L.greeting}, <strong>${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}</strong>!
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:${MUTED};">
      ${L.customIntro(
        orderIdShort,
        getCommunicationLabel(order.communicationMethod, lang),
        social,
      )}
    </p>

    ${buildCertificateEmailBanner(order, lang)}

    ${
      order.accessToken
        ? `<div style="margin:0 0 24px;padding:22px;border-radius:16px;background:${PANEL};border:1px solid ${LINE};text-align:center;">
             <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:${MUTED};">${L.cabinetBlurb}</p>
             ${ctaButton(escapeHtml(cabinetUrl(order.accessToken)), L.cabinetBtn)}
           </div>`
        : ""
    }

    ${sectionLabel(L.garments)}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
      ${garmentsHtml}
    </table>

    <div style="margin:0 0 20px;padding:16px 18px;border-radius:16px;background:${PANEL};border:1px solid ${LINE};">
      ${summaryLine(L.estimate, escapeHtml(summary.priceRange))}
      ${summaryLine(L.prepayment(summary.prepaymentPercent), escapeHtml(summary.prepaymentRange))}
      ${
        summary.includesReadyAccessories
          ? `<p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:${FAINT};">${L.accessoriesNote}</p>`
          : ""
      }
      ${summaryLine(L.start, escapeHtml(summary.startDate))}
      ${summaryLine(L.ready, escapeHtml(summary.readyRange))}
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid ${LINE};">
        ${getDeliveryHtml(order, L)}
      </div>
      <p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:${FAINT};">
        ${L.estimateNote}
      </p>
    </div>

    ${
      summary.comment
        ? `${sectionLabel(L.comment)}
           <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${MUTED};white-space:pre-wrap;">${escapeHtml(summary.comment)}</p>`
        : ""
    }

    ${(() => {
      const refs = readReferenceImageUrls(order);
      if (refs.length === 0) return "";
      const links = refs
        .map(
          (url) =>
            `<li style="margin:4px 0;"><a href="${escapeHtml(url)}" style="color:#c4414d;text-decoration:none;">${escapeHtml(url)}</a></li>`,
        )
        .join("");
      return `${sectionLabel(lang === "uk" ? "Фото-референс" : "Photo reference")}
         <ul style="margin:0 0 20px;padding-left:18px;font-size:14px;line-height:1.6;color:${MUTED};">${links}</ul>`;
    })()}

    ${sectionLabel(L.measurements)}
    ${measurementsHtml}
  `;

  return emailShell(L.customTitle(orderIdShort), body, lang);
};

/**
 * Відправляє клієнту лист-підтвердження замовлення через Resend.
 * Не кидає помилку назовні — замовлення вже збережене в БД.
 */
export const sendGiftCertificateEmail = async (cert: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  number: number;
  electronicCode: string;
  amountUah: number;
  validUntil: string;
  buyerLabel: string;
  paymentMethod: "online" | "cod";
  communicationMethod: string;
  socialUsername: string;
  cabinetUrl?: string;
  giftUrl?: string;
  physicalDeliveryNote?: string;
}) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM || "K.I.RICH <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY не знайдено — лист про сертифікат не відправлено.");
    return;
  }
  if (!cert.email?.trim()) return;

  const via = getCommunicationLabel(cert.communicationMethod, "uk");
  const handle = cert.socialUsername?.trim()
    ? ` (@${cert.socialUsername.replace(/^@/, "")})`
    : "";
  const pay = "Оплата онлайн (менеджер надішле реквізити)";

  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${INK};">
      ${escapeHtml(cert.firstName)}, дякуємо! Заявку на подарунковий сертифікат прийнято.
    </p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.65;color:${MUTED};">
      Менеджер зв’яжеться з вами через <strong style="color:${INK};">${escapeHtml(via)}</strong>${escapeHtml(handle)}
      для підтвердження оплати. Після зарахування коштів сертифікат стане <strong style="color:${INK};">активним</strong>.
    </p>
  ${sectionLabel("Ваш сертифікат")}
    <p style="margin:0 0 8px;font-size:14px;color:${MUTED};"><strong style="color:${INK};">Номер:</strong>
      <span style="font-family:${SERIF};font-size:22px;color:${ACCENT};"> ${cert.number}</span></p>
    <p style="margin:0 0 8px;font-size:14px;color:${MUTED};"><strong style="color:${INK};">Електронний код для сайту:</strong>
      <span style="font-family:ui-monospace,monospace;font-size:18px;letter-spacing:0.04em;color:${INK};"> ${escapeHtml(cert.electronicCode)}</span></p>
    <p style="margin:0 0 8px;font-size:14px;color:${MUTED};"><strong style="color:${INK};">Номінал:</strong> ${Number(cert.amountUah).toLocaleString("uk-UA")} ₴</p>
    <p style="margin:0 0 8px;font-size:14px;color:${MUTED};"><strong style="color:${INK};">Діє до:</strong> ${escapeHtml(cert.validUntil)}</p>
    <p style="margin:0 0 8px;font-size:14px;color:${MUTED};"><strong style="color:${INK};">Покупець:</strong> ${escapeHtml(cert.buyerLabel)}</p>
    <p style="margin:0 0 8px;font-size:14px;color:${MUTED};"><strong style="color:${INK};">Оплата:</strong> ${escapeHtml(pay)}</p>
    ${
      cert.physicalDeliveryNote
        ? `<p style="margin:0 0 20px;font-size:14px;color:${MUTED};"><strong style="color:${INK};">Доставка фізичного сертифіката:</strong> ${escapeHtml(cert.physicalDeliveryNote)}</p>`
        : ""
    }
  ${sectionLabel("Контакти")}
    <p style="margin:0 0 6px;font-size:14px;color:${MUTED};"><strong style="color:${INK};">Телефон:</strong> ${escapeHtml(cert.phone)}</p>
    <p style="margin:0;font-size:14px;color:${MUTED};"><strong style="color:${INK};">Email:</strong> ${escapeHtml(cert.email)}</p>
    ${
      cert.cabinetUrl
        ? `<div style="margin:24px 0 8px;text-align:center;">${ctaButton(escapeHtml(cert.cabinetUrl), "Кабінет сертифіката")}</div>`
        : ""
    }
    ${
      cert.giftUrl
        ? `<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:${MUTED};text-align:center;">Подарункове посилання для одержувача:<br/><a href="${escapeHtml(cert.giftUrl)}" style="color:${ACCENT};word-break:break-all;">${escapeHtml(cert.giftUrl)}</a></p>`
        : ""
    }
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:${FAINT};">
      Збережіть <strong style="color:${MUTED};">електронний код</strong> — його вводять у полі «Подарунковий сертифікат» під час оформлення замовлення на сайті. Номер ${cert.number} — для звернень до менеджера.
    </p>
  `;

  const html = emailShell(`Подарунковий сертифікат № ${cert.number}`, body, "uk");
  const subject = `K.I.RICH — подарунковий сертифікат № ${cert.number}`;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [cert.email],
      subject,
      html,
      replyTo: process.env.EMAIL_REPLY_TO || "kirich.sewing.studio@gmail.com",
    });
    if (error) console.error("❌ Resend (сертифікат):", error);
    else console.log("✅ Email про сертифікат:", data?.id);
  } catch (error) {
    console.error("❌ Не вдалося відправити email про сертифікат:", error);
  }
};

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
  const L = EMAIL_COPY[emailLang(order)];
  const subject = isCustomOrder
    ? L.customSubject(orderIdShort)
    : L.readySubject(orderIdShort);

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

/**
 * "Find my order" on the website: sends the cabinet links of the client's orders.
 * Never throws — the endpoint always answers the same.
 */
export const sendLoginCodeEmail = async (email: string, code: string) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ В .env не знайдено RESEND_API_KEY. Пропускаю лист із кодом входу.");
    return;
  }

  const html = emailShell(
    "Вхід до особистого кабінету",
    `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${MUTED};">
       Ваш код для входу — введіть його на сторінці «Мої замовлення». Код діє 10 хвилин.
     </p>
     <p style="margin:0 0 20px;text-align:center;font-family:${SERIF};font-size:42px;font-weight:500;letter-spacing:0.4em;color:${ACCENT};">
       ${escapeHtml(code)}
     </p>
     <p style="margin:0;font-size:12px;line-height:1.6;color:${FAINT};">
       Якщо ви не просили код — просто проігноруйте цей лист.
     </p>`,
  );

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "K.I.RICH <onboarding@resend.dev>",
      to: [email],
      subject: `K.I.RICH — код входу ${code}`,
      html,
      replyTo: process.env.EMAIL_REPLY_TO || "kirich.sewing.studio@gmail.com",
    });
    if (error) console.error("❌ Помилка Resend API:", error);
  } catch (error) {
    console.error("❌ Не вдалося відправити код входу:", error);
  }
};

/** "Time to take measurements" — sent by the daily job ~30 days before the start. */
export const sendMeasurementsReminderEmail = async (order: any) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !order?.email || !order?.accessToken) return;

  const L = EMAIL_COPY[emailLang(order)];
  const html = emailShell(
    L.reminderTitle,
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${INK};">
       ${L.reminderGreeting(escapeHtml(order.firstName))}
     </p>
     <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:${MUTED};">
       ${L.reminderBody}
     </p>
     <div style="margin:0 0 8px;text-align:center;">
       ${ctaButton(escapeHtml(cabinetUrl(order.accessToken)), L.reminderBtn)}
     </div>`,
    emailLang(order),
  );

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "K.I.RICH <onboarding@resend.dev>",
      to: [order.email],
      subject: `K.I.RICH — ${L.reminderTitle}`,
      html,
      replyTo: process.env.EMAIL_REPLY_TO || "kirich.sewing.studio@gmail.com",
    });
    if (error) console.error("❌ Помилка Resend API:", error);
  } catch (error) {
    console.error("❌ Не вдалося відправити нагадування про мірки:", error);
  }
};
