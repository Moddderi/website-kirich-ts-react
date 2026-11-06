import {
  MEASUREMENT_LABELS_UK,
  MEASUREMENT_UNIT_LABELS,
  todayISO,
  type MeasurementType,
  type MeasurementUnit,
  type TailoringProgram,
} from "@project/shared";
import {
  isNotionConfigured,
  normalizeNotionId,
} from "./notionAvailability.js";
import { invalidateAvailabilityCache } from "./availability.js";
import {
  TAILORING_TYPE_META,
  buildCustomOrderSummary,
  formatDateUk,
} from "./tailoringSummary.js";

/**
 * Creates the order in the studio's Notion database `[DB] Замовлення`
 * right after the customer checks out on the site.
 *
 * What gets filled (properties are located by type/name, so renaming a column
 * in Notion does not break anything — missing ones are simply skipped):
 *  - Name (title)            "📘 Прізвище Ім'я [№]"  (📘 = з сайту, 📕 = ручне)
 *  - Місце замовлення        "З сайту"
 *  - № замовлення            last number + 1
 *  - Status                  "Нове замовлення"
 *  - Дата замовлення         today
 *  - Термін виконання        start → latest ready date (this is what the site calendar reads)
 *  - Клієнт (relation)       found in [DB] Клієнти by "Прізвище Ім'я", or created
 *  - Вироби (relation)       base item of [DB] Прайс for the chosen program + garment
 *  - Країна / Населений пункт / Відділення адреса
 *  - page body               contacts, comment, measurements, price estimate
 */

const NOTION_VERSION = "2022-06-28";
const TIMEOUT_MS = 10000;
const SCHEMA_TTL_MS = 60 * 60 * 1000;

/**
 * Which [DB] Прайс item represents a garment on the site, per dance program.
 * Names must match "Назва виробу" exactly. The manager refines the exact model
 * in Notion afterwards. Edit freely — an unknown name is just skipped.
 */
export const BASE_PRICE_ITEMS: Record<
  TailoringProgram,
  Record<MeasurementType, string[]>
> = {
  ST: {
    body: ["Сорочка-боді ST"],
    jacket: ["Жилет ST з атласним коміром"],
    pants: ["Штани ST"],
    suit: ["Фрачний комплект"],
  },
  LAT: {
    body: ["Сорочка-боді LAT"],
    jacket: [],
    pants: ["Штани LAT"],
    suit: ["Сорочка-боді LAT", "Штани LAT"],
  },
};

/** Blue book in the title = order came from the website (manual orders use 📕). */
const SITE_ORDER_EMOJI = "📘";
/** Value of the "Місце замовлення" select for website orders. */
const SITE_SOURCE_LABEL = "З сайту";

/* ------------------------------ Notion client ----------------------------- */

const notion = async <T>(
  path: string,
  init: { method?: "GET" | "POST" | "PATCH"; body?: unknown } = {},
): Promise<T> => {
  // NOTION_DRY_RUN=1: read everything, but only log what would be written.
  if (process.env.NOTION_DRY_RUN === "1" && init.method !== "GET" && path === "/pages") {
    console.log("🧪 [dry-run] POST /pages", JSON.stringify(init.body, null, 2));
    return { id: "dry-run-page-id", url: null } as T;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`https://api.notion.com/v1${path}`, {
      method: init.method ?? (init.body ? "POST" : "GET"),
      headers: {
        Authorization: `Bearer ${(process.env.NOTION_TOKEN as string).trim()}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `Notion ${init.method ?? "GET"} ${path} → ${response.status} ${detail.slice(0, 300)}`,
      );
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
};

interface SchemaProperty {
  id: string;
  name: string;
  type: string;
  status?: { options: Array<{ name: string }> };
  select?: { options: Array<{ name: string }> };
  relation?: { database_id: string };
}

interface DbSchema {
  id: string;
  properties: Record<string, SchemaProperty>;
}

const schemaCache = new Map<string, { schema: DbSchema; at: number }>();

const getSchema = async (databaseId: string): Promise<DbSchema> => {
  const hit = schemaCache.get(databaseId);
  if (hit && Date.now() - hit.at < SCHEMA_TTL_MS) return hit.schema;

  const raw = await notion<{ id: string; properties: Record<string, SchemaProperty> }>(
    `/databases/${databaseId}`,
  );
  const schema: DbSchema = { id: raw.id, properties: raw.properties };
  schemaCache.set(databaseId, { schema, at: Date.now() });
  return schema;
};

/** First property of one of the given types whose name matches (or any, if no pattern). */
const findProp = (
  schema: DbSchema,
  types: string[],
  pattern?: RegExp,
): SchemaProperty | null => {
  const found = Object.values(schema.properties).find(
    (p) => types.includes(p.type) && (!pattern || pattern.test(p.name)),
  );
  return found ?? null;
};

const richText = (content: string) => [
  { type: "text", text: { content: content.slice(0, 1900) } },
];

const pageTitle = (page: any): string => {
  for (const prop of Object.values<any>(page.properties ?? {})) {
    if (prop.type === "title") {
      return (prop.title ?? []).map((t: any) => t.plain_text).join("");
    }
  }
  return "";
};

const normalizeName = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

/* --------------------------------- Clients -------------------------------- */

const CONTACT_SELECT_NAME: Record<string, string> = {
  telegram: "telegram",
  instagram: "instagram",
  whatsapp: "whatsapp",
};

const findOrCreateClient = async (
  clientsDbId: string,
  order: any,
): Promise<string> => {
  const schema = await getSchema(clientsDbId);
  const titleProp = findProp(schema, ["title"]);
  if (!titleProp) throw new Error("В таблиці клієнтів немає title-колонки");

  const fullName = `${order.lastName} ${order.firstName}`.trim();
  const prefix = normalizeName(fullName);

  const search = await notion<{ results: any[] }>(
    `/databases/${clientsDbId}/query`,
    {
      body: {
        page_size: 50,
        filter: {
          property: titleProp.name,
          title: { contains: String(order.lastName).trim() },
        },
      },
    },
  );

  const matches = search.results.filter((page) =>
    normalizeName(pageTitle(page)).startsWith(prefix),
  );

  // Exactly one person with this name → link. Zero or ambiguous → new card
  // (never attach someone's order to the wrong client).
  if (matches.length === 1) return matches[0].id;

  const properties: Record<string, unknown> = {
    [titleProp.name]: { title: richText(fullName) },
  };

  const contactProp = findProp(schema, ["select"], /зв.язк|contact/i);
  const contactName = CONTACT_SELECT_NAME[String(order.communicationMethod)];
  const contactOption = contactProp?.select?.options.find(
    (o) => normalizeName(o.name) === contactName,
  );
  if (contactProp && contactOption) {
    properties[contactProp.name] = { select: { name: contactOption.name } };
  }

  const statusProp = findProp(schema, ["select"], /статус/i);
  const newStatus = statusProp?.select?.options.find((o) =>
    /новий|new/i.test(o.name),
  );
  if (statusProp && newStatus) {
    properties[statusProp.name] = { select: { name: newStatus.name } };
  }

  const created = await notion<{ id: string }>("/pages", {
    body: { parent: { database_id: clientsDbId }, properties },
  });
  return created.id;
};

/* ------------------------------ Price items -------------------------------- */

const findPriceItems = async (
  priceDbId: string,
  names: string[],
): Promise<Array<{ id: string; name: string }>> => {
  if (names.length === 0) return [];

  const schema = await getSchema(priceDbId);
  const titleProp = findProp(schema, ["title"]);
  if (!titleProp) return [];

  const result: Array<{ id: string; name: string }> = [];
  for (const name of names) {
    const search = await notion<{ results: any[] }>(
      `/databases/${priceDbId}/query`,
      {
        body: {
          page_size: 5,
          filter: { property: titleProp.name, title: { equals: name } },
        },
      },
    );
    if (search.results[0]) {
      result.push({ id: search.results[0].id, name });
    } else {
      console.warn(`⚠️ Notion: у прайсі не знайдено позицію «${name}»`);
    }
  }
  return result;
};

/* ------------------------------ Order number ------------------------------- */

const nextOrderNumber = async (
  ordersDbId: string,
  numberProp: SchemaProperty,
): Promise<number | null> => {
  const res = await notion<{ results: any[] }>(
    `/databases/${ordersDbId}/query`,
    {
      body: {
        page_size: 1,
        sorts: [{ property: numberProp.name, direction: "descending" }],
      },
    },
  );
  const last = res.results[0]?.properties?.[numberProp.name]?.number;
  return typeof last === "number" ? Math.floor(last) + 1 : null;
};

/* ------------------------------- Page body --------------------------------- */

const heading = (text: string) => ({
  object: "block",
  type: "heading_3",
  heading_3: { rich_text: richText(text) },
});
const bullet = (text: string) => ({
  object: "block",
  type: "bulleted_list_item",
  bulleted_list_item: { rich_text: richText(text) },
});
const paragraph = (text: string) => ({
  object: "block",
  type: "paragraph",
  paragraph: { rich_text: richText(text) },
});

const parseMeasurements = (
  data: unknown,
): { unit: MeasurementUnit; values: Record<string, string> } => {
  let parsed: any = data;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return { unit: "cm", values: {} };
    }
  }
  if (!parsed || typeof parsed !== "object") return { unit: "cm", values: {} };

  const source =
    parsed.values && typeof parsed.values === "object" ? parsed.values : parsed;
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries<any>(source)) {
    if (key === "unit" || key === "waist_definition") continue;
    if (typeof value === "string" || typeof value === "number") {
      values[key] = String(value);
    }
  }
  return { unit: parsed.unit === "in" ? "in" : "cm", values };
};

const DELIVERY_LABEL: Record<string, string> = {
  nova_poshta: "Нова Пошта",
  ukrposhta: "Укрпошта",
  pickup: "Самовивіз зі студії (Полтава)",
};
const PAYMENT_LABEL: Record<string, string> = {
  online: "Онлайн (передоплата)",
  cod: "Накладений платіж",
};

const buildBody = (order: any, unlinkedItems: string[]) => {
  const summary = buildCustomOrderSummary({ ...order, displayCurrency: "UAH" });
  const { unit, values } = parseMeasurements(order.items?.[0]?.measurements);
  const unitLabel = MEASUREMENT_UNIT_LABELS[unit];
  const shortId = String(order.id ?? "").split("-")[0].toUpperCase();

  const blocks: unknown[] = [
    paragraph(`🌐 Замовлення з сайту (індивідуальний пошив) · №${shortId}`),
    heading("Вироби"),
    ...summary.lines.map((line) =>
      bullet(`${line.label} — ${line.priceRange}, ${line.leadDays}`),
    ),
  ];

  if (unlinkedItems.length > 0) {
    blocks.push(
      paragraph(
        `⚠️ Не знайдено в прайсі, додайте вручну: ${unlinkedItems.join(", ")}`,
      ),
    );
  }

  blocks.push(
    heading("Орієнтовно (на момент замовлення на сайті)"),
    bullet(`Вартість: ${summary.priceRange}`),
    bullet(
      `Передоплата ${summary.prepaymentPercent}%: ${summary.prepaymentRange}`,
    ),
    bullet(`Старт: ${summary.startDate}`),
    bullet(`Готовність: ${summary.readyRange}`),
    paragraph(
      "Точну вартість і передоплату потрібно узгодити з клієнтом, після чого вказати «Фіксована ціна».",
    ),
    heading("Клієнт і контакти"),
    bullet(`Телефон: ${order.phone}`),
    bullet(`Email: ${order.email}`),
    bullet(
      `Зв'язок: ${String(order.communicationMethod ?? "").toUpperCase()} · ${order.socialUsername ?? "—"}`,
    ),
    bullet(`Доставка: ${DELIVERY_LABEL[order.deliveryMethod] ?? order.deliveryMethod}`),
    bullet(`Оплата: ${PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}`),
  );

  if (summary.comment) {
    blocks.push(heading("Коментар клієнта"), paragraph(summary.comment));
  }

  blocks.push(heading(`Мірки (${unitLabel})`));
  const entries = Object.entries(values);
  if (entries.length === 0) {
    blocks.push(paragraph("Мірки будуть уточнені менеджером особисто."));
  } else {
    for (const [key, value] of entries) {
      const label =
        MEASUREMENT_LABELS_UK[key as keyof typeof MEASUREMENT_LABELS_UK] ?? key;
      blocks.push(bullet(`${label}: ${value}`));
    }
  }

  return blocks.slice(0, 95); // Notion allows 100 blocks per request
};

/* --------------------------------- Public ---------------------------------- */

/**
 * Creates the Notion order. Throws on failure — the caller decides how to
 * report it; the website order itself must never fail because of Notion.
 */
export const createNotionOrder = async (
  order: any,
): Promise<{ url: string | null } | null> => {
  if (!isNotionConfigured() || order.orderType !== "custom") return null;

  const ordersDbId = normalizeNotionId(process.env.NOTION_DATABASE_ID);
  if (!ordersDbId) throw new Error("NOTION_DATABASE_ID is invalid");

  const schema = await getSchema(ordersDbId);
  const props: Record<string, unknown> = {};

  const titleProp = findProp(schema, ["title"]);
  const numberProp = findProp(schema, ["number"], /№|номер|інвойс|number/i);
  const statusProp = findProp(schema, ["status"]);
  const orderDateProp = findProp(schema, ["date"], /дата замовлення|order date/i);
  const periodProp = findProp(
    schema,
    ["date"],
    /термін|дедлайн|deadline|due|виконан/i,
  );
  const clientProp = findProp(schema, ["relation"], /клієнт|client/i);
  const itemsProp = findProp(schema, ["relation"], /вироб|виріб|item|product/i);
  const sourceProp = findProp(
    schema,
    ["select", "status"],
    /місце замовлення|джерело|source|origin/i,
  );
  const countryProp = findProp(schema, ["rich_text"], /країна|country/i);
  const cityProp = findProp(schema, ["rich_text"], /населений|місто|city/i);
  const branchProp = findProp(schema, ["rich_text"], /відділення|адрес|branch/i);

  const orderNumber = numberProp
    ? await nextOrderNumber(ordersDbId, numberProp)
    : null;

  if (titleProp) {
    const name = `${order.lastName} ${order.firstName}`.trim();
    props[titleProp.name] = {
      title: richText(
        `${SITE_ORDER_EMOJI} ${orderNumber ? `${name} [${orderNumber}]` : name}`,
      ),
    };
  }

  if (sourceProp) {
    const options =
      (sourceProp.type === "status"
        ? sourceProp.status?.options
        : sourceProp.select?.options) ?? [];
    const siteOption = options.find((o) => /сайт|site|web/i.test(o.name));
    // A "select" creates the option on the fly; a "status" can only use existing ones.
    if (siteOption || sourceProp.type === "select") {
      const value = { name: siteOption?.name ?? SITE_SOURCE_LABEL };
      props[sourceProp.name] =
        sourceProp.type === "status" ? { status: value } : { select: value };
    }
  }
  if (numberProp && orderNumber !== null) {
    props[numberProp.name] = { number: orderNumber };
  }

  const newStatus = statusProp?.status?.options.find((o) =>
    /нове замовлення|new order/i.test(o.name),
  );
  if (statusProp && newStatus) {
    props[statusProp.name] = { status: { name: newStatus.name } };
  }

  if (orderDateProp) props[orderDateProp.name] = { date: { start: todayISO() } };

  const startDate: string | null = order.estimate?.startDate ?? null;
  const readyTo: string | null = order.estimate?.readyTo ?? null;
  if (periodProp && startDate) {
    props[periodProp.name] = {
      date: { start: startDate, end: readyTo && readyTo > startDate ? readyTo : null },
    };
  }

  const postal =
    order.deliveryMethod === "nova_poshta" || order.deliveryMethod === "ukrposhta";
  if (postal) {
    if (countryProp) props[countryProp.name] = { rich_text: richText("Україна") };
    if (cityProp && order.city) props[cityProp.name] = { rich_text: richText(order.city) };
    if (branchProp && order.warehouse) {
      props[branchProp.name] = { rich_text: richText(order.warehouse) };
    }
  }

  if (clientProp?.relation) {
    const clientId = await findOrCreateClient(clientProp.relation.database_id, order);
    props[clientProp.name] = { relation: [{ id: clientId }] };
  }

  const unlinkedItems: string[] = [];
  if (itemsProp?.relation) {
    const programs: Partial<Record<MeasurementType, TailoringProgram>> =
      order.estimate?.programs ?? {};
    const types: MeasurementType[] = Array.isArray(order.estimate?.types)
      ? order.estimate.types
      : [];

    // Each garment has its own program: pants may be LAT while the body is ST.
    const wanted: string[] = [];
    for (const type of types) {
      const names = BASE_PRICE_ITEMS[programs[type] ?? "ST"][type] ?? [];
      if (names.length === 0) {
        const program = programs[type] ?? "ST";
        unlinkedItems.push(`${TAILORING_TYPE_META[type]?.label ?? type} ${program}`);
      }
      wanted.push(...names);
    }

    const unique = [...new Set(wanted)];
    const found = await findPriceItems(itemsProp.relation.database_id, unique);
    if (found.length > 0) {
      props[itemsProp.name] = { relation: found.map((item) => ({ id: item.id })) };
    }
    unlinkedItems.push(
      ...unique.filter((name) => !found.some((item) => item.name === name)),
    );
  }

  const page = await notion<{ id: string; url?: string }>("/pages", {
    body: {
      parent: { database_id: ordersDbId },
      properties: props,
      children: buildBody(order, unlinkedItems),
    },
  });

  // The calendar reads these same orders → refresh it immediately.
  invalidateAvailabilityCache();

  console.log(
    `✅ Notion: створено замовлення ${orderNumber ?? ""} (${formatDateUk(startDate)} → ${formatDateUk(readyTo)})`,
  );
  return { url: page.url ?? null };
};
