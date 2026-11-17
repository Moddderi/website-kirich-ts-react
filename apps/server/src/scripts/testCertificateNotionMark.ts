/**
 * Marks one certificate as used in Notion (manual QA).
 *
 * Usage:
 *   npx tsx src/scripts/testCertificateNotionMark.ts --number 1022
 *   npx tsx src/scripts/testCertificateNotionMark.ts --page <notion-page-id>
 *
 * Reverts Notion status back to «Активний» after verify unless --keep is passed.
 */
import "dotenv/config";
import db from "../models/index.js";
import { findProp, getSchema, notionRequest } from "../utils/notionOrders.js";
import {
  getNotionGiftCertificateStatus,
  markNotionGiftCertificateUsed,
} from "../utils/notionCertificates.js";
import { normalizeNotionId } from "../utils/notionAvailability.js";

const args = process.argv.slice(2);
const keep = args.includes("--keep");
const numberIdx = args.indexOf("--number");
const pageIdx = args.indexOf("--page");

const readStatusName = (page: {
  properties?: Record<
    string,
    { type?: string; status?: { name?: string }; select?: { name?: string } }
  >;
}): string | null => {
  for (const [name, prop] of Object.entries(page.properties ?? {})) {
    if (!/статус/i.test(name)) continue;
    if (prop.type === "status") return prop.status?.name ?? null;
    if (prop.type === "select") return prop.select?.name ?? null;
  }
  return null;
};

const setActiveInNotion = async (pageId: string) => {
  const page = await notionRequest<{ parent: { database_id?: string } }>(
    `/pages/${pageId}`,
    { method: "GET" },
  );
  const dbId = page.parent?.database_id;
  if (!dbId) throw new Error("Page has no parent database");
  const schema = await getSchema(dbId);
  const statusProp = findProp(schema, ["status", "select"], /^статус$/i);
  if (!statusProp) throw new Error("No Статус column");
  const active =
    statusProp.type === "status"
      ? statusProp.status?.options.find(
          (o) => /актив|active/i.test(o.name) && !/неактив|inactive/i.test(o.name),
        )?.name
      : statusProp.select?.options.find(
          (o) => /актив|active/i.test(o.name) && !/неактив|inactive/i.test(o.name),
        )?.name;
  if (!active) throw new Error("No Активний option in Notion");
  const props: Record<string, unknown> = {};
  if (statusProp.type === "status") {
    props[statusProp.name] = { status: { name: active } };
  } else {
    props[statusProp.name] = { select: { name: active } };
  }
  await notionRequest(`/pages/${pageId}`, {
    method: "PATCH",
    body: { properties: props },
  });
};

async function main() {
  const activateOnly = args.includes("--activate");

  let pageId: string | null =
    pageIdx >= 0 ? String(args[pageIdx + 1] ?? "") : null;

  if (!pageId && numberIdx >= 0) {
    const num = Number(args[numberIdx + 1]);
    const cert = await db.GiftCertificate.findOne({ where: { number: num } });
    if (!cert?.notionPageId) {
      throw new Error(`Certificate №${num} not found or missing notionPageId`);
    }
    pageId = cert.notionPageId;
    console.log(`Cert №${num} → page ${pageId}`);
  }

  if (!pageId) {
    console.error("Pass --number <n> or --page <id>");
    process.exit(1);
  }

  if (activateOnly) {
    await setActiveInNotion(pageId);
    const page = await notionRequest<{ properties?: Record<string, unknown> }>(
      `/pages/${pageId}`,
      { method: "GET" },
    );
    console.log("Status now:", readStatusName(page));
    return;
  }

  const before = await notionRequest<{ properties?: Record<string, unknown> }>(
    `/pages/${pageId}`,
    { method: "GET" },
  );
  console.log("Status before:", readStatusName(before));

  await markNotionGiftCertificateUsed(pageId, {
    usedAt: new Date().toISOString().slice(0, 10),
    clientName: "QA Тест",
    orderShortId: "TEST0001",
  });

  const after = await notionRequest<{ properties?: Record<string, unknown> }>(
    `/pages/${pageId}`,
    { method: "GET" },
  );
  const afterName = readStatusName(after);
  const mapped = await getNotionGiftCertificateStatus(pageId);
  console.log("Status after:", afterName, "→", mapped);

  if (!/використ/i.test(afterName ?? "")) {
    throw new Error(`Expected «Використан*» in Notion, got «${afterName}»`);
  }
  console.log("✓ markNotionGiftCertificateUsed works");

  if (!keep) {
    await setActiveInNotion(pageId);
    const reverted = await notionRequest<{ properties?: Record<string, unknown> }>(
      `/pages/${pageId}`,
      { method: "GET" },
    );
    console.log("Reverted to:", readStatusName(reverted));
  } else {
    console.log("--keep: left as used in Notion");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.sequelize.close());