/**
 * Reads [DB] Прайс «Ціна (грн)» and updates accessory rows in products.json by «Назва виробу».
 *
 *   npx tsx src/scripts/syncAccessoryPricesFromNotion.ts
 *   npx tsx src/scripts/syncAccessoryPricesFromNotion.ts --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "../loadEnv.js";
import {
  findProp,
  getSchema,
  notionRequest,
  pageTitle,
} from "../utils/notionOrders.js";
import { isNotionConfigured, normalizeNotionId } from "../utils/notionAvailability.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes("--dry-run");

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

const resolvePriceDbId = async (ordersDbId: string): Promise<string> => {
  const ordersSchema = await getSchema(ordersDbId);
  const positionsProp = findProp(ordersSchema, ["relation"], /позиц/i);
  if (!positionsProp?.relation) {
    throw new Error("У [DB] Замовлення немає зв'язку «Позиції»");
  }
  const positionsDbId = positionsProp.relation.database_id;
  const posSchema = await getSchema(positionsDbId);
  const strip = (id: string) => id.replace(/-/g, "").toLowerCase();
  const priceRel = Object.values(posSchema.properties).find(
    (p) =>
      p.type === "relation" &&
      p.relation &&
      strip(p.relation.database_id) !== strip(ordersDbId),
  );
  if (!priceRel?.relation) throw new Error("У позицій немає зв'язку з прайсом");
  return priceRel.relation.database_id;
};

export const fetchNotionUahPricesByTitle = async (): Promise<Map<string, number>> => {
  const ordersDbId = normalizeNotionId(process.env.NOTION_DATABASE_ID);
  if (!ordersDbId) throw new Error("NOTION_DATABASE_ID invalid");

  const priceDbId = await resolvePriceDbId(ordersDbId);
  const schema = await getSchema(priceDbId);
  const uahProp =
    findProp(schema, ["number"], /ціна.*\(грн\)/i) ??
    findProp(schema, ["number"], /грн/i);
  if (!uahProp) throw new Error('У [DB] Прайс немає колонки «Ціна (грн)»');

  const byName = new Map<string, number>();
  let cursor: string | undefined;
  do {
    const res: { results: any[]; has_more: boolean; next_cursor: string | null } =
      await notionRequest(`/databases/${priceDbId}/query`, {
        body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
      });
    for (const page of res.results) {
      const name = pageTitle(page);
      const prop = page.properties?.[uahProp.name];
      if (!name || prop?.type !== "number" || typeof prop.number !== "number") {
        continue;
      }
      const price = Math.round(prop.number);
      const isActive = Object.values<any>(page.properties ?? {}).some(
        (p) => p.type === "select" && /^активн/i.test(p.select?.name ?? ""),
      );
      if (!byName.has(name) || isActive) byName.set(name, price);
    }
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);

  return byName;
};

const matchAccessoryPrice = (
  product: { name: string; search_name?: string },
  byName: Map<string, number>,
): number | null => {
  const candidates = [product.name, product.search_name].filter(Boolean) as string[];
  for (const c of candidates) {
    if (byName.has(c)) return byName.get(c)!;
  }
  for (const c of candidates) {
    const nc = norm(c);
    for (const [n, p] of byName) {
      if (norm(n) === nc) return p;
    }
  }
  if (/chrisanne|запонки clover/i.test(product.name)) {
    return byName.get("Запонки") ?? null;
  }
  return null;
};

async function main() {
  if (!isNotionConfigured()) throw new Error("NOTION_TOKEN / NOTION_DATABASE_ID missing");

  const byName = await fetchNotionUahPricesByTitle();
  const jsonPath = path.resolve(__dirname, "../../products.json");
  const products = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Array<{
    name: string;
    search_name?: string;
    product_code: string;
    price: number;
    main_category: string;
  }>;

  let changed = 0;
  for (const row of products) {
    if (row.main_category !== "accessories") continue;
    const notionPrice = matchAccessoryPrice(row, byName);
    if (notionPrice === null) {
      console.warn(`⚠️ ${row.product_code} «${row.name}»: немає в Notion`);
      continue;
    }
    if (row.price === notionPrice) continue;
    console.log(`${row.product_code} ${row.name}: ${row.price} → ${notionPrice}`);
    row.price = notionPrice;
    changed++;
  }

  if (changed === 0) {
    console.log("Без змін — ціни в products.json збігаються з Notion.");
    return;
  }

  if (dryRun) {
    console.log(`(dry-run) змінилось би ${changed} позицій`);
    return;
  }

  fs.writeFileSync(jsonPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");
  console.log(`✓ Оновлено ${changed} аксесуарів у products.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});