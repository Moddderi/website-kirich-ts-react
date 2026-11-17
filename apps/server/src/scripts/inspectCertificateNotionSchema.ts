import "dotenv/config";
import db from "../models/index.js";
import { normalizeNotionId, isNotionConfigured } from "../utils/notionAvailability.js";
import { findProp, getSchema, notionRequest } from "../utils/notionOrders.js";
import {
  getNotionGiftCertificateStatus,
  mapNotionCertificateStatus,
} from "../utils/notionCertificates.js";

const pickUsedOption = (
  statusProp: NonNullable<ReturnType<typeof findProp>>,
): string | undefined => {
  const pattern = /використ|used|погаш/i;
  if (statusProp.type === "status") {
    return statusProp.status?.options.find((o) => pattern.test(o.name))?.name;
  }
  if (statusProp.type === "select") {
    return statusProp.select?.options.find((o) => pattern.test(o.name))?.name;
  }
  return undefined;
};

async function main() {
  console.log("Notion configured:", isNotionConfigured());
  const dbId = normalizeNotionId(process.env.NOTION_CERTIFICATES_DATABASE_ID);
  if (!dbId) {
    console.error("NOTION_CERTIFICATES_DATABASE_ID missing");
    process.exit(1);
  }

  const schema = await getSchema(dbId);
  const statusProp = findProp(schema, ["status", "select"], /статус/i);
  if (!statusProp) {
    console.error("No «Статус» property in certificates DB");
    process.exit(1);
  }
  const opts =
    statusProp.type === "status"
      ? statusProp.status?.options
      : statusProp.select?.options;
  console.log(`Property «${statusProp.name}» (${statusProp.type})`);
  console.log("Options:", opts?.map((o) => o.name).join(" | ") ?? "—");
  const usedOption = pickUsedOption(statusProp);
  console.log("Matched «used» option for PATCH:", usedOption ?? "NONE — fix Notion options");

  const usedInDb = await db.GiftCertificate.findAll({
    where: { status: "used" },
    limit: 5,
    order: [["usedAt", "DESC"]],
  });

  const recent = await db.GiftCertificate.findAll({
    order: [["number", "DESC"]],
    limit: 8,
  });
  if (recent.length > 0) {
    console.log("\nRecent certificates in DB:");
    for (const cert of recent) {
      console.log(
        `  №${cert.number} ${cert.status} notion=${cert.notionPageId ? "yes" : "no"} ${cert.electronicCode ?? ""}`,
      );
    }
  }

  if (usedInDb.length === 0) {
    console.log(
      "\nNo used certificates in DB yet — place a test order with an active cert to verify Notion updates.",
    );
    process.exit(0);
  }

  console.log(`\nChecking ${usedInDb.length} used cert(s) in DB vs Notion:`);
  for (const cert of usedInDb) {
    const label = cert.electronicCode ?? `№${cert.number}`;
    if (!cert.notionPageId) {
      console.log(`- ${label}: no notionPageId (Notion will never update)`);
      continue;
    }
    const page = await notionRequest<{
      properties?: Record<
        string,
        { type?: string; status?: { name?: string }; select?: { name?: string } }
      >;
    }>(`/pages/${cert.notionPageId}`, { method: "GET" });
    let notionName: string | null = null;
    for (const [name, prop] of Object.entries(page.properties ?? {})) {
      if (!/статус/i.test(name)) continue;
      notionName =
        prop.type === "status"
          ? (prop.status?.name ?? null)
          : prop.type === "select"
            ? (prop.select?.name ?? null)
            : null;
    }
    const mapped = mapNotionCertificateStatus(notionName);
    const cached = await getNotionGiftCertificateStatus(cert.notionPageId);
    const ok = mapped === "used";
    console.log(
      `- ${label} order ${cert.usedOrderId?.slice(0, 8) ?? "?"}: Notion «${notionName ?? "?"}» → ${mapped} ${ok ? "✓" : "✗ expected used"}`,
    );
    if (cached !== mapped) {
      console.log(`  (cache reader returned ${cached})`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.sequelize.close());