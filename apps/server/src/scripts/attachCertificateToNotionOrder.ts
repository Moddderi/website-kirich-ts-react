/**
 * Links [DB] Замовлення «Сертифікат» for an existing order (backfill / QA).
 *
 *   npx tsx src/scripts/attachCertificateToNotionOrder.ts --notion-number 1334
 *   npx tsx src/scripts/attachCertificateToNotionOrder.ts --order-id <uuid-prefix>
 */
import "dotenv/config";
import { Op, where, fn, col, cast } from "sequelize";
import db from "../models/index.js";
import { findProp, getSchema, notionRequest } from "../utils/notionOrders.js";
import { normalizeNotionId, isNotionConfigured } from "../utils/notionAvailability.js";
import { resolveCertificateNotionPageId } from "../utils/notionOrders.js";

const args = process.argv.slice(2);
const numIdx = args.indexOf("--notion-number");
const idIdx = args.indexOf("--order-id");

async function findNotionPageByOrderNumber(n: number): Promise<string | null> {
  const dbId = normalizeNotionId(process.env.NOTION_DATABASE_ID);
  if (!dbId) throw new Error("NOTION_DATABASE_ID");
  const schema = await getSchema(dbId);
  const numberProp = findProp(schema, ["number"], /№|номер|інвойс|number/i);
  if (!numberProp) throw new Error("No order number property");

  const res = await notionRequest<{ results: Array<{ id: string }> }>(
    `/databases/${dbId}/query`,
    {
      body: {
        page_size: 1,
        filter: {
          property: numberProp.name,
          number: { equals: n },
        },
      },
    },
  );
  return res.results[0]?.id ?? null;
}

async function main() {
  if (!isNotionConfigured()) throw new Error("Notion not configured");

  let order: InstanceType<typeof db.Order> | null = null;
  let notionPageId: string | null = null;

  if (idIdx >= 0) {
    const prefix = String(args[idIdx + 1] ?? "").toLowerCase();
    order = await db.Order.findOne({
      where: where(fn("lower", cast(col("id"), "text")), "LIKE", `${prefix}%`),
    });
    notionPageId = order?.notionPageId ?? null;
  }

  if (numIdx >= 0) {
    const n = Number(args[numIdx + 1]);
    notionPageId = await findNotionPageByOrderNumber(n);
    if (!order) {
      order = await db.Order.findOne({ where: { notionPageId } });
    }
    if (!order) {
      order = await db.Order.findOne({
        where: { certificateCode: { [Op.ne]: null } },
        order: [["createdAt", "DESC"]],
      });
    }
  }

  if (!notionPageId) {
    throw new Error("Notion order page not found — pass --notion-number or --order-id");
  }
  if (!order?.certificateCode) {
    throw new Error("Order has no certificateCode in DB");
  }

  const certPageId = await resolveCertificateNotionPageId(String(order.certificateCode));
  if (!certPageId) {
    throw new Error(`No notionPageId for certificate ${order.certificateCode}`);
  }

  const ordersDbId = normalizeNotionId(process.env.NOTION_DATABASE_ID)!;
  const schema = await getSchema(ordersDbId);
  const certificateProp = findProp(schema, ["relation"], /сертифікат|certificate/i);
  if (!certificateProp?.name) throw new Error("No Сертифікат relation on orders DB");

  await notionRequest(`/pages/${notionPageId}`, {
    method: "PATCH",
    body: {
      properties: {
        [certificateProp.name]: { relation: [{ id: certPageId }] },
      },
    },
  });

  if (!order.notionPageId) {
    await order.update({ notionPageId });
  }

  console.log(
    `✓ Order ${order.id.slice(0, 8)} (Notion ${numIdx >= 0 ? args[numIdx + 1] : notionPageId.slice(0, 8)}) → cert ${order.certificateCode}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.sequelize.close());