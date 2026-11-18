/**
 * Replaces plain-text Cloudinary bullets with clickable links on an existing Notion order page.
 *
 *   npx tsx src/scripts/fixNotionReferenceLinks.ts
 *   npx tsx src/scripts/fixNotionReferenceLinks.ts --notion-page <page-id>
 *   npx tsx src/scripts/fixNotionReferenceLinks.ts --order-id <uuid>
 */
import "../loadEnv.js";
import db from "../models/index.js";
import { isNotionConfigured } from "../utils/notionAvailability.js";
import {
  REFERENCE_PHOTOS_HEADING,
  buildReferenceImageNotionBlocks,
  notionRequest,
} from "../utils/notionOrders.js";
import { readReferenceImageUrls } from "../utils/orderReferenceImages.js";

const plainText = (block: any): string => {
  const key = block.type as string;
  const rich = block[key]?.rich_text as Array<{ plain_text?: string }> | undefined;
  return (rich ?? []).map((t) => t.plain_text ?? "").join("");
};

const hasTextLink = (block: any): boolean => {
  const key = block.type as string;
  const rich = block[key]?.rich_text as Array<{ text?: { link?: { url?: string } } }> | undefined;
  return (rich ?? []).some((t) => Boolean(t.text?.link?.url));
};

const isTestLead = (firstName: string, lastName: string, email: string) => {
  const blob = `${firstName} ${lastName} ${email}`.toLowerCase();
  return (
    /тест|test|лид|dry|qa\b/.test(blob) || email.endsWith("@example.com")
  );
};

async function listPageBlocks(pageId: string) {
  const blocks: any[] = [];
  let cursor: string | undefined;
  do {
    const qs = new URLSearchParams({ page_size: "100" });
    if (cursor) qs.set("start_cursor", cursor);
    const res = await notionRequest<{
      results: any[];
      has_more: boolean;
      next_cursor: string | null;
    }>(`/blocks/${pageId}/children?${qs.toString()}`, { method: "GET" });
    blocks.push(...res.results);
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

async function archiveBlock(blockId: string) {
  await notionRequest(`/blocks/${blockId}`, {
    method: "PATCH",
    body: { archived: true },
  });
}

async function fixPage(pageId: string, urls: string[]) {
  const blocks = await listPageBlocks(pageId);
  const headingIdx = blocks.findIndex(
    (b) =>
      b.type === "heading_3" && plainText(b).trim() === REFERENCE_PHOTOS_HEADING,
  );

  if (headingIdx < 0) {
    await notionRequest(`/blocks/${pageId}/children`, {
      method: "PATCH",
      body: { children: buildReferenceImageNotionBlocks(urls) },
    });
    console.log(`✓ Додано секцію «${REFERENCE_PHOTOS_HEADING}» (${urls.length} фото)`);
    return;
  }

  const headingId = blocks[headingIdx].id as string;
  const toArchive: string[] = [];

  for (let i = headingIdx + 1; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === "heading_3" || b.type === "heading_2" || b.type === "heading_1") {
      break;
    }
    if (b.type === "bulleted_list_item") {
      const text = plainText(b);
      const isRef =
        /res\.cloudinary\.com\/.*\/order-references\//i.test(text) ||
        (!hasTextLink(b) && /^https:\/\//i.test(text));
      if (isRef || (!hasTextLink(b) && text.includes("cloudinary"))) {
        toArchive.push(b.id);
      } else {
        break;
      }
    } else if (b.type === "paragraph" && plainText(b) === "") {
      continue;
    } else {
      break;
    }
  }

  for (const id of toArchive) {
    await archiveBlock(id);
  }

  const linkBullets = buildReferenceImageNotionBlocks(urls).slice(1);
  await notionRequest(`/blocks/${pageId}/children`, {
    method: "PATCH",
    body: {
      children: linkBullets,
      after: headingId,
    },
  });

  console.log(
    `✓ Notion ${pageId.slice(0, 8)}…: видалено ${toArchive.length} рядків, додано ${urls.length} клікабельних посилань`,
  );
}

async function main() {
  if (!isNotionConfigured()) {
    throw new Error("Notion not configured");
  }

  const notionIdx = process.argv.indexOf("--notion-page");
  const orderIdx = process.argv.indexOf("--order-id");

  let pageId: string | null =
    notionIdx >= 0 ? process.argv[notionIdx + 1] ?? null : null;
  let urls: string[] = [];

  if (orderIdx >= 0) {
    const order = await db.Order.findByPk(process.argv[orderIdx + 1]);
    if (!order?.notionPageId) throw new Error("Order not found or no notionPageId");
    pageId = order.notionPageId;
    urls = readReferenceImageUrls(order);
  } else if (!pageId) {
    const orders = await db.Order.findAll({
      where: { orderType: "custom" },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    const hit = orders.find(
      (o) =>
        o.notionPageId &&
        readReferenceImageUrls(o).length > 0 &&
        isTestLead(String(o.firstName), String(o.lastName), String(o.email ?? "")),
    );
    if (!hit?.notionPageId) {
      const anyWithRefs = orders.find(
        (o) => o.notionPageId && readReferenceImageUrls(o).length > 0,
      );
      if (!anyWithRefs?.notionPageId) {
        throw new Error("No custom order with referenceImageUrls + notionPageId");
      }
      console.log(
        `ℹ️ Тестовий лід не знайдено — беремо останнє замовлення з фото: ${anyWithRefs.firstName} ${anyWithRefs.lastName}`,
      );
      pageId = anyWithRefs.notionPageId;
      urls = readReferenceImageUrls(anyWithRefs);
    } else {
      pageId = hit.notionPageId;
      urls = readReferenceImageUrls(hit);
      console.log(`ℹ️ Тестовий лід: ${hit.firstName} ${hit.lastName} · ${String(hit.id).slice(0, 8)}`);
    }
  }

  if (!pageId || urls.length === 0) {
    throw new Error("Nothing to fix (need notionPageId + reference URLs in estimate)");
  }

  await fixPage(pageId, urls);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.sequelize.close());