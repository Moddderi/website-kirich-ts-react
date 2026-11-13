import {
  MEASUREMENT_LABELS_UK,
  MEASUREMENT_UNIT_LABELS,
  todayISO,
  type MeasurementType,
  type MeasurementUnit,
  type TailoringProgram,
  type WorkDaysTable,
} from "@project/shared";
import {
  isNotionConfigured,
  normalizeNotionId,
} from "./notionAvailability.js";
import { invalidateAvailabilityCache } from "./availability.js";
import { cabinetUrl } from "./links.js";
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
 *  - Позиції замовлення      one row in [DB] Позиції замовлення per garment
 *                            ("1", "2", …) → Виріб (base item of [DB] Прайс for the
 *                            chosen ST/LAT program) + Кількість, linked to the order
 *  - Телефон / Username / Тип зв'язку   (the client card rolls these up from orders)
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

export const notionRequest = async <T>(
  path: string,
  init: { method?: "GET" | "POST" | "PATCH"; body?: unknown } = {},
): Promise<T> => {
  // NOTION_DRY_RUN=1: read everything, but only log what would be written.
  if (process.env.NOTION_DRY_RUN === "1" && init.method !== "GET" && path === "/pages") {
    console.log("🧪 [dry-run] POST /pages", JSON.stringify(init.body, null, 2));
    return { id: "dry-run-page-id", url: null } as T;
  }
  if (
    process.env.NOTION_DRY_RUN === "1" &&
    init.method === "PATCH" &&
    (path.startsWith("/pages/") || path.startsWith("/blocks/"))
  ) {
    console.log(`🧪 [dry-run] PATCH ${path}`, JSON.stringify(init.body, null, 2));
    return {} as T;
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

export interface SchemaProperty {
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

export const getSchema = async (databaseId: string): Promise<DbSchema> => {
  const hit = schemaCache.get(databaseId);
  if (hit && Date.now() - hit.at < SCHEMA_TTL_MS) return hit.schema;

  const raw = await notionRequest<{ id: string; properties: Record<string, SchemaProperty> }>(
    `/databases/${databaseId}`,
  );
  const schema: DbSchema = { id: raw.id, properties: raw.properties };
  schemaCache.set(databaseId, { schema, at: Date.now() });
  return schema;
};

/** First property of one of the given types whose name matches (or any, if no pattern). */
export const findProp = (
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

export const pageTitle = (page: any): string => {
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

  const search = await notionRequest<{ results: any[] }>(
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

  const created = await notionRequest<{ id: string }>("/pages", {
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
    const search = await notionRequest<{ results: any[] }>(
      `/databases/${priceDbId}/query`,
      {
        body: {
          page_size: 5,
          filter: { property: titleProp.name, title: { equals: name } },
        },
      },
    );
    // Archived duplicates may exist → prefer the "Активний" one.
    const isActive = (page: any) =>
      Object.values<any>(page.properties ?? {}).some(
        (prop) => prop.type === "select" && /^активн/i.test(prop.select?.name ?? ""),
      );
    const best = search.results.find(isActive) ?? search.results[0];
    if (best) {
      result.push({ id: best.id, name });
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
  const res = await notionRequest<{ results: any[] }>(
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

/** "Мірки (см)" heading + one bullet per measurement (or a placeholder text). */
export const buildMeasurementBlocks = (
  data: unknown,
  emptyText: string,
  title?: string,
) => {
  const { unit, values } = parseMeasurements(data);
  const blocks: unknown[] = [
    heading(title ?? `Мірки (${MEASUREMENT_UNIT_LABELS[unit]})`),
  ];
  const entries = Object.entries(values);
  if (entries.length === 0) {
    blocks.push(paragraph(emptyText));
  } else {
    for (const [key, value] of entries) {
      const label =
        MEASUREMENT_LABELS_UK[key as keyof typeof MEASUREMENT_LABELS_UK] ?? key;
      blocks.push(bullet(`${label}: ${value}`));
    }
  }
  return blocks;
};

/** Adds blocks to the end of an existing order page. */
export const appendNotionBlocks = async (pageId: string, children: unknown[]) => {
  await notionRequest(`/blocks/${pageId}/children`, {
    method: "PATCH",
    body: { children: children.slice(0, 95) },
  });
};

const buildBody = (order: any, unlinkedItems: string[]) => {
  const summary = buildCustomOrderSummary({ ...order, displayCurrency: "UAH" });
  const shortId = String(order.id ?? "").split("-")[0].toUpperCase();

  const blocks: unknown[] = [
    paragraph(`🌐 Замовлення з сайту (індивідуальний пошив) · №${shortId}`),
    ...(order.accessToken
      ? [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                { type: "text", text: { content: "🔗 Кабінет клієнта (передайте посилання клієнту): " } },
                {
                  type: "text",
                  text: {
                    content: cabinetUrl(order.accessToken),
                    link: { url: cabinetUrl(order.accessToken) },
                  },
                },
              ],
            },
          },
        ]
      : []),
    ...(order.estimate?.measurementsPending
      ? [
          paragraph(
            "📆 Замовлення на майбутню дату: після передоплати змініть статус на «Заброньовано» — за 30 днів до початку сайт сам поставить «Планове зняття мірок» і відкриє клієнту бланк мірок.",
          ),
        ]
      : []),
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

  blocks.push(
    ...buildMeasurementBlocks(
      order.items?.[0]?.measurements,
      order.estimate?.measurementsPending
        ? "Мірки будуть зняті пізніше: клієнт передасть їх через кабінет за 30 днів до початку (статус у Notion зміниться автоматично)."
        : "Мірки будуть уточнені менеджером особисто.",
    ),
  );

  return blocks.slice(0, 95); // Notion allows 100 blocks per request
};

/* -------------------------------- Positions -------------------------------- */

/** The [DB] Прайс id = the relation of the positions DB that is not the orders DB. */
const resolvePriceDbId = async (
  positionsDbId: string,
  ordersDbId: string,
): Promise<string> => {
  const schema = await getSchema(positionsDbId);
  const rel = Object.values(schema.properties).find(
    (p) =>
      p.type === "relation" &&
      p.relation &&
      stripId(p.relation.database_id) !== stripId(ordersDbId),
  );
  if (!rel?.relation) throw new Error("У таблиці позицій немає зв'язку з прайсом");
  return rel.relation.database_id;
};

const stripId = (id: string) => id.replace(/-/g, "").toLowerCase();

/**
 * One row in [DB] Позиції замовлення per garment: title "1", "2", …,
 * «Виріб» → [DB] Прайс, «Кількість», «Замовлення» → the order page.
 */
const createPositions = async (
  positionsDbId: string,
  ordersDbId: string,
  orderPageId: string,
  items: Array<{ id: string; qty: number }>,
): Promise<void> => {
  const schema = await getSchema(positionsDbId);
  const titleProp = findProp(schema, ["title"]);
  const relations = Object.values(schema.properties).filter(
    (p) => p.type === "relation" && p.relation,
  );
  const orderProp = relations.find(
    (p) => stripId(p.relation!.database_id) === stripId(ordersDbId),
  );
  const priceProp = relations.find((p) => p !== orderProp);
  const qtyProp = findProp(schema, ["number"], /кільк|qty|quantity/i);

  if (!titleProp || !orderProp || !priceProp) {
    throw new Error(
      "У таблиці позицій не знайдено title / зв'язок із замовленням / зв'язок із прайсом",
    );
  }

  for (const [index, item] of items.entries()) {
    const properties: Record<string, unknown> = {
      [titleProp.name]: { title: richText(String(index + 1)) },
      [orderProp.name]: { relation: [{ id: orderPageId }] },
      [priceProp.name]: { relation: [{ id: item.id }] },
    };
    if (qtyProp) properties[qtyProp.name] = { number: item.qty };

    await notionRequest("/pages", {
      body: { parent: { database_id: positionsDbId }, properties },
    });
  }
};

/* ------------------------- Production time (work days) --------------------- */

const WORK_DAYS_TTL_MS = 60 * 60 * 1000; // the price list is edited rarely
let workDaysCache: { table: WorkDaysTable; at: number } | null = null;

/** "0,25" / "0.5" / 2 → number of working days. */
const parseDays = (value: unknown): number | null => {
  const n =
    typeof value === "number"
      ? value
      : parseFloat(String(value ?? "").replace(",", ".").trim());
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const readTermCell = (page: any, termName: string): number | null => {
  const prop = page.properties?.[termName];
  if (!prop) return null;
  if (prop.type === "number") return parseDays(prop.number);
  if (prop.type === "formula") return parseDays(prop.formula?.number ?? prop.formula?.string);
  if (prop.type === "rich_text") {
    return parseDays((prop.rich_text ?? []).map((t: any) => t.plain_text).join(""));
  }
  return null;
};

/**
 * Production time in working days per garment and program, summed over the
 * base price items the site maps garments to (BASE_PRICE_ITEMS). Read from the
 * «Термін виготовлення» column of [DB] Прайс. null = not available.
 */
export const getWorkDaysTable = async (): Promise<WorkDaysTable | null> => {
  if (!isNotionConfigured()) return null;
  if (workDaysCache && Date.now() - workDaysCache.at < WORK_DAYS_TTL_MS) {
    return workDaysCache.table;
  }

  const ordersDbId = normalizeNotionId(process.env.NOTION_DATABASE_ID);
  if (!ordersDbId) return null;

  const ordersSchema = await getSchema(ordersDbId);
  const positionsProp = findProp(ordersSchema, ["relation"], /позиц/i);
  if (!positionsProp?.relation) return null;

  const priceDbId = await resolvePriceDbId(positionsProp.relation.database_id, ordersDbId);
  const priceSchema = await getSchema(priceDbId);
  const titleProp = findProp(priceSchema, ["title"]);
  const termProp = findProp(
    priceSchema,
    ["rich_text", "number", "formula"],
    /термін|срок|term|lead/i,
  );
  if (!titleProp || !termProp) return null;

  const days = new Map<string, number>();
  let cursor: string | undefined;
  do {
    const res: { results: any[]; has_more: boolean; next_cursor: string | null } =
      await notionRequest(`/databases/${priceDbId}/query`, {
        body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
      });
    for (const page of res.results) {
      const name = pageTitle(page);
      const value = readTermCell(page, termProp.name);
      if (!name || value === null) continue;
      const isActive = Object.values<any>(page.properties ?? {}).some(
        (prop) => prop.type === "select" && /^активн/i.test(prop.select?.name ?? ""),
      );
      // The "Активний" duplicate wins over archived ones
      if (!days.has(name) || isActive) days.set(name, value);
    }
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);

  const table: WorkDaysTable = { ST: {}, LAT: {} };
  for (const program of Object.keys(BASE_PRICE_ITEMS) as TailoringProgram[]) {
    for (const type of Object.keys(BASE_PRICE_ITEMS[program]) as MeasurementType[]) {
      const names = BASE_PRICE_ITEMS[program][type];
      if (names.length === 0) continue;
      const values = names.map((name) => days.get(name));
      if (values.some((v) => v === undefined)) continue;
      table[program][type] = Math.round((values as number[]).reduce((a, b) => a + b, 0) * 100) / 100;
    }
  }

  workDaysCache = { table, at: Date.now() };
  return table;
};

/* --------------------------------- Public ---------------------------------- */

/**
 * Creates the Notion order. Throws on failure — the caller decides how to
 * report it; the website order itself must never fail because of Notion.
 */
export const createNotionOrder = async (
  order: any,
): Promise<{ url: string | null; id: string } | null> => {
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
  const positionsProp = findProp(schema, ["relation"], /позиц/i);
  const phoneProp = findProp(schema, ["phone_number"], /телефон|phone/i);
  const usernameProp = findProp(schema, ["rich_text"], /username|нік|логін/i);
  const contactProp = findProp(schema, ["select"], /зв.язк|contact/i);
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

  // A booking far in the future waits for the prepayment; others are simply new.
  const wantsPrepayment = Boolean(order.estimate?.measurementsPending);
  const newStatus =
    (wantsPrepayment
      ? statusProp?.status?.options.find((o) => /передпл|предоплат/i.test(o.name))
      : undefined) ??
    statusProp?.status?.options.find((o) => /нове замовлення|new order/i.test(o.name));
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

  if (phoneProp && order.phone) {
    props[phoneProp.name] = { phone_number: String(order.phone) };
  }
  if (usernameProp && order.socialUsername) {
    props[usernameProp.name] = { rich_text: richText(String(order.socialUsername)) };
  }
  if (contactProp) {
    const wantedContact = CONTACT_SELECT_NAME[String(order.communicationMethod)];
    const option = contactProp.select?.options.find(
      (o) => normalizeName(o.name) === wantedContact,
    );
    if (option) props[contactProp.name] = { select: { name: option.name } };
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

  // Garments → base items of [DB] Прайс (each garment has its own ST/LAT program).
  const unlinkedItems: string[] = [];
  const positionItems: Array<{ id: string; qty: number }> = [];
  if (positionsProp?.relation) {
    const programs: Partial<Record<MeasurementType, TailoringProgram>> =
      order.estimate?.programs ?? {};
    const types: MeasurementType[] = Array.isArray(order.estimate?.types)
      ? order.estimate.types
      : [];

    const quantities = new Map<string, number>();
    for (const type of types) {
      const program = programs[type] ?? "ST";
      const names = BASE_PRICE_ITEMS[program][type] ?? [];
      if (names.length === 0) {
        unlinkedItems.push(`${TAILORING_TYPE_META[type]?.label ?? type} ${program}`);
      }
      for (const name of names) quantities.set(name, (quantities.get(name) ?? 0) + 1);
    }

    const priceDbId = await resolvePriceDbId(
      positionsProp.relation.database_id,
      ordersDbId,
    );
    const found = await findPriceItems(priceDbId, [...quantities.keys()]);
    for (const item of found) {
      positionItems.push({ id: item.id, qty: quantities.get(item.name) ?? 1 });
    }
    unlinkedItems.push(
      ...[...quantities.keys()].filter((name) => !found.some((f) => f.name === name)),
    );
  }

  const page = await notionRequest<{ id: string; url?: string }>("/pages", {
    body: {
      parent: { database_id: ordersDbId },
      properties: props,
      children: buildBody(order, unlinkedItems),
    },
  });

  // The calendar reads these same orders → refresh it immediately.
  invalidateAvailabilityCache();

  if (positionsProp?.relation && positionItems.length > 0) {
    try {
      await createPositions(
        positionsProp.relation.database_id,
        ordersDbId,
        page.id,
        positionItems,
      );
    } catch (error) {
      // The order itself exists — only the positions need to be added by hand.
      throw new Error(
        `Замовлення створено, але позиції не додано (${(error as Error).message})`,
      );
    }
  }

  console.log(
    `✅ Notion: створено замовлення ${orderNumber ?? ""} (${formatDateUk(startDate)} → ${formatDateUk(readyTo)})`,
  );
  return { url: page.url ?? null, id: page.id };
};
