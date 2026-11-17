import "../loadEnv.js";
import { normalizeNotionId } from "../utils/notionAvailability.js";
import { findProp, getSchema } from "../utils/notionOrders.js";
import { createNotionGiftCertificate } from "../utils/notionCertificates.js";
import { todayISO } from "@project/shared";

const dbId = normalizeNotionId(process.env.NOTION_CERTIFICATES_DATABASE_ID);
if (!dbId) {
  console.error("NOTION_CERTIFICATES_DATABASE_ID missing or invalid");
  process.exit(1);
}

const main = async () => {
  const schema = await getSchema(dbId);
  console.log("Database properties:");
  for (const [name, prop] of Object.entries(schema.properties)) {
    console.log(`  - ${name} (${prop.type})`);
  }

  const mapped = {
    certNumberTitle: findProp(schema, ["title"], /№.*сертифікат/i)?.name,
    purchase: findProp(schema, ["date"], /покупк/i)?.name,
    amount: findProp(schema, ["number"], /^сума/i)?.name,
    buyer: findProp(schema, ["rich_text", "title"], /покупець/i)?.name,
  };
  console.log("Mapped columns:", mapped);

  const today = todayISO();
  const page = await createNotionGiftCertificate({
    number: 9999,
    electronicCode: "KIR-TEST-9X7Y",
    amountUah: 1000,
    buyerLabel: "Notion sync test",
    purchasedAt: today,
    validUntil: today,
    purchaserFirstName: "Test",
    purchaserLastName: "API",
    purchaserPhone: "+380000000000",
    purchaserEmail: "test@example.com",
    comment: "dry test — видаліть рядок у Notion",
  });

  console.log("Created page:", page);
};

void main().catch((error) => {
  console.error("FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
});