import {
  MIN_GIFT_CERTIFICATE_NUMBER,
  type GiftCertificatePurchase,
} from "@project/shared";
import {
  isNotionConfigured,
  normalizeNotionId,
} from "./notionAvailability.js";
import { findProp, getSchema, notionRequest } from "./notionOrders.js";

const richText = (content: string) => [
  { type: "text", text: { content: content.slice(0, 1900) } },
];

const addYearsISO = (iso: string, years: number): string => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y + years}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

const pickNotionStatusOption = (
  statusProp: NonNullable<ReturnType<typeof findProp>>,
  pattern: RegExp,
): string | undefined => {
  if (statusProp.type === "status") {
    return statusProp.status?.options.find((o) => pattern.test(o.name))?.name;
  }
  if (statusProp.type === "select") {
    return statusProp.select?.options.find((o) => pattern.test(o.name))?.name;
  }
  return undefined;
};

const setNotionStatusProp = (
  props: Record<string, unknown>,
  statusProp: NonNullable<ReturnType<typeof findProp>>,
  optionName: string,
) => {
  if (statusProp.type === "status") {
    props[statusProp.name] = { status: { name: optionName } };
  } else if (statusProp.type === "select") {
    props[statusProp.name] = { select: { name: optionName } };
  }
};

export type GiftCertificateDbStatus =
  | "inactive"
  | "active"
  | "used"
  | "expired";

/** Notion «Статус» (select/status) → статус у БД сайту. */
export const mapNotionCertificateStatus = (
  name: string | null | undefined,
): GiftCertificateDbStatus | null => {
  const s = (name ?? "").toLowerCase();
  if (/неактив|inactive/.test(s)) return "inactive";
  if (/актив|active/.test(s)) return "active";
  if (/протермін|expired/.test(s)) return "expired";
  if (/використ|used|погаш/.test(s)) return "used";
  return null;
};

const readCertificateStatusNameFromPage = (page: {
  properties?: Record<string, { type?: string; status?: { name?: string }; select?: { name?: string } }>;
}): string | null => {
  for (const [propName, prop] of Object.entries(page.properties ?? {})) {
    if (!/статус/i.test(propName)) continue;
    if (prop.type === "status") return prop.status?.name ?? null;
    if (prop.type === "select") return prop.select?.name ?? null;
  }
  for (const prop of Object.values(page.properties ?? {})) {
    if (prop.type === "status") return prop.status?.name ?? null;
  }
  return null;
};

const NOTION_CERT_STATUS_CACHE_MS = 2 * 60 * 1000;
const notionCertStatusCache = new Map<
  string,
  { status: GiftCertificateDbStatus; at: number }
>();

export const invalidateGiftCertificateNotionCache = (pageId: string) => {
  notionCertStatusCache.delete(pageId);
};

/** Live status from Notion (cached ~2 min), like the client cabinet for orders. */
export const getNotionGiftCertificateStatus = async (
  pageId: string,
): Promise<GiftCertificateDbStatus | null> => {
  if (!isNotionConfigured() || !pageId || pageId === "dry-run-page-id") {
    return null;
  }

  const hit = notionCertStatusCache.get(pageId);
  if (hit && Date.now() - hit.at < NOTION_CERT_STATUS_CACHE_MS) {
    return hit.status;
  }

  const page = await notionRequest<{
    archived?: boolean;
    in_trash?: boolean;
    properties?: Record<string, { type?: string; status?: { name?: string }; select?: { name?: string } }>;
  }>(`/pages/${pageId}`, { method: "GET" });

  if (page.archived || page.in_trash) return null;

  const mapped = mapNotionCertificateStatus(
    readCertificateStatusNameFromPage(page),
  );
  if (mapped) {
    notionCertStatusCache.set(pageId, { status: mapped, at: Date.now() });
  }
  return mapped;
};

export const createNotionGiftCertificate = async (cert: {
  number: number;
  electronicCode: string;
  amountUah: number;
  buyerLabel: string;
  purchasedAt: string;
  validUntil: string;
  purchaserFirstName: string;
  purchaserLastName: string;
  purchaserPhone: string;
  purchaserEmail: string;
  comment?: string | null;
  physicalDelivery?: {
    method: "nova_poshta" | "ukrposhta" | "pickup";
    city?: string | null;
    warehouse?: string | null;
  } | null;
}): Promise<{ id: string; url: string | null } | null> => {
  if (!isNotionConfigured()) return null;

  const dbId = normalizeNotionId(process.env.NOTION_CERTIFICATES_DATABASE_ID);
  if (!dbId) {
    console.warn(
      "⚠️ NOTION_CERTIFICATES_DATABASE_ID не задано — сертифікат лише в БД сайту",
    );
    return null;
  }

  const schema = await getSchema(dbId);
  const props: Record<string, unknown> = {};

  // [DB] Сертифікати: «№ сертифікату» — title; «Статус» — select (Неактивний → Активний).
  const certNumberTitleProp = findProp(
    schema,
    ["title"],
    /№.*сертифікат|номер.*сертифікат/i,
  );
  const purchaseDateProp = findProp(
    schema,
    ["date"],
    /дата покупки|purchase/i,
  );
  const amountProp = findProp(schema, ["number"], /^сума/i);
  const buyerProp = findProp(schema, ["rich_text", "title"], /покупець|buyer/i);

  const numberTitle = String(cert.number);
  if (certNumberTitleProp) {
    props[certNumberTitleProp.name] = { title: richText(numberTitle) };
  } else {
    const fallbackTitle = findProp(schema, ["title"]);
    if (fallbackTitle) {
      props[fallbackTitle.name] = { title: richText(numberTitle) };
    }
  }

  if (purchaseDateProp) {
    props[purchaseDateProp.name] = { date: { start: cert.purchasedAt } };
  }
  if (amountProp) {
    props[amountProp.name] = { number: cert.amountUah };
  }
  if (buyerProp) {
    if (buyerProp.type === "title") {
      props[buyerProp.name] = { title: richText(cert.buyerLabel) };
    } else {
      props[buyerProp.name] = { rich_text: richText(cert.buyerLabel) };
    }
  }

  const electronicProp = findProp(
    schema,
    ["rich_text"],
    /електронн.*код|electronic/i,
  );
  if (electronicProp) {
    props[electronicProp.name] = {
      rich_text: richText(cert.electronicCode),
    };
  }

  const validUntilProp = findProp(
    schema,
    ["date"],
    /діє до|valid until/i,
  );
  if (validUntilProp) {
    props[validUntilProp.name] = { date: { start: cert.validUntil } };
  }

  const statusProp = findProp(schema, ["status", "select"], /^статус$/i);
  if (statusProp) {
    const inactive = pickNotionStatusOption(statusProp, /неактив|inactive/i);
    if (inactive) setNotionStatusProp(props, statusProp, inactive);
  }

  const physicalNeedProp = findProp(
    schema,
    ["status", "select"],
    /потрібен.*фізичн|фізичн.*варіант|physical/i,
  );
  if (physicalNeedProp) {
    const yes = pickNotionStatusOption(physicalNeedProp, /^так$|yes/i);
    const no = pickNotionStatusOption(physicalNeedProp, /^ні$|no/i);
    if (cert.physicalDelivery && yes) {
      setNotionStatusProp(props, physicalNeedProp, yes);
    } else if (!cert.physicalDelivery && no) {
      setNotionStatusProp(props, physicalNeedProp, no);
    }
  }

  if (Object.keys(props).length === 0) {
    throw new Error(
      "Не вдалося зіставити колонки [DB] Сертифікати з API (перевірте назви полів).",
    );
  }

  const bodyBlocks: Array<{
    object: "block";
    type: "paragraph";
    paragraph: { rich_text: ReturnType<typeof richText> };
  }> = [
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: richText(
          `Оформлено на сайті. Контакт: ${cert.purchaserPhone}, ${cert.purchaserEmail}.` +
            (cert.comment?.trim() ? ` Коментар: ${cert.comment.trim()}` : ""),
        ),
      },
    },
  ];

  if (cert.physicalDelivery) {
    bodyBlocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: richText(
          `📦 Доставка фізичного сертифіката (з сайту):\n${formatPhysicalDeliveryBody(cert.physicalDelivery)}`,
        ),
      },
    });
  }

  const page = await notionRequest<{ id: string; url?: string }>("/pages", {
    body: {
      parent: { database_id: dbId },
      properties: props,
      children: bodyBlocks,
    },
  });

  return { id: page.id, url: page.url ?? null };
};

export const markNotionGiftCertificateUsed = async (
  pageId: string,
  details: {
    usedAt: string;
    clientName: string;
    orderShortId: string;
  },
): Promise<void> => {
  if (!isNotionConfigured() || !pageId || pageId === "dry-run-page-id") return;

  const page = await notionRequest<{ parent: { database_id?: string } }>(
    `/pages/${pageId}`,
    { method: "GET" },
  );
  const dbId = page.parent?.database_id;
  if (!dbId) return;

  const schema = await getSchema(dbId);
  const props: Record<string, unknown> = {};

  const usedDateProp = findProp(schema, ["date"], /дата використання/i);
  const clientProp = findProp(
    schema,
    ["rich_text", "title"],
    /клієнт.*використ|використав/i,
  );
  const statusProp = findProp(schema, ["status", "select"], /^статус$/i);

  if (usedDateProp) {
    props[usedDateProp.name] = { date: { start: details.usedAt } };
  }
  if (clientProp) {
    const value = `${details.clientName} · замовлення ${details.orderShortId}`;
    if (clientProp.type === "title") {
      props[clientProp.name] = { title: richText(value) };
    } else {
      props[clientProp.name] = { rich_text: richText(value) };
    }
  }
  if (statusProp) {
    const used = pickNotionStatusOption(statusProp, /використ|used|погаш/i);
    if (used) setNotionStatusProp(props, statusProp, used);
  }

  if (Object.keys(props).length === 0) return;

  await notionRequest(`/pages/${pageId}`, {
    method: "PATCH",
    body: { properties: props },
  });
  invalidateGiftCertificateNotionCache(pageId);
};

export const giftCertificateValidityEnd = (purchaseDate: string) =>
  addYearsISO(purchaseDate, 1);

export const formatPhysicalDeliveryNote = (d: {
  method: "nova_poshta" | "ukrposhta" | "pickup";
  city?: string | null;
  warehouse?: string | null;
}) => {
  if (d.method === "pickup") return "самовивіз студії, Полтава";
  if (d.method === "ukrposhta") {
    return `Укрпошта · ${d.city ?? ""} · ${d.warehouse ?? ""}`.trim();
  }
  return `Нова пошта · ${d.city ?? ""} · ${d.warehouse ?? ""}`.trim();
};

const deliveryMethodLabel = (
  method: "nova_poshta" | "ukrposhta" | "pickup",
) => {
  if (method === "pickup") return "Самовивіз із студії (Полтава)";
  if (method === "ukrposhta") return "Укрпошта";
  return "Нова пошта";
};

/** Multi-line text for the Notion page body (delivery from checkout). */
export const formatPhysicalDeliveryBody = (d: {
  method: "nova_poshta" | "ukrposhta" | "pickup";
  city?: string | null;
  warehouse?: string | null;
}) => {
  const lines = [
    `Спосіб: ${deliveryMethodLabel(d.method)}`,
  ];
  if (d.method !== "pickup") {
    if (d.city?.trim()) lines.push(`Місто: ${d.city.trim()}`);
    if (d.warehouse?.trim()) lines.push(`Відділення / адреса: ${d.warehouse.trim()}`);
  }
  return lines.join("\n");
};

export const assertCertificateNumberAllowed = (n: number) => {
  if (!Number.isInteger(n) || n < MIN_GIFT_CERTIFICATE_NUMBER) {
    throw new Error(
      `Номер сертифіката має бути не менше ${MIN_GIFT_CERTIFICATE_NUMBER}`,
    );
  }
};

export type { GiftCertificatePurchase };