import "dotenv/config";
import { isNotionConfigured, normalizeNotionId } from "../utils/notionAvailability.js";
import { getSchema } from "../utils/notionOrders.js";

async function main() {
  if (!isNotionConfigured()) throw new Error("Notion not configured");
  const dbId = normalizeNotionId(process.env.NOTION_DATABASE_ID);
  if (!dbId) throw new Error("NOTION_DATABASE_ID missing");
  const schema = await getSchema(dbId);
  for (const p of Object.values(schema.properties)) {
    if (
      /сертифікат|certificate|передпл|ціна|price/i.test(p.name) ||
      p.type === "relation"
    ) {
      console.log(`${p.name} (${p.type})`, p.relation?.database_id?.slice(0, 8) ?? "");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});