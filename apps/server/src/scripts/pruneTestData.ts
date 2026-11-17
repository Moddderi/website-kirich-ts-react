/**
 * Removes test orders/leads and gift certificates except a kept cert number.
 *
 *   npx tsx src/scripts/pruneTestData.ts
 *   npx tsx src/scripts/pruneTestData.ts --keep-cert 1020 --dry-run
 */
import { Op } from "sequelize";
import "../loadEnv.js";
import db from "../models/index.js";

const dryRun = process.argv.includes("--dry-run");
const keepCertIdx = process.argv.indexOf("--keep-cert");
const keepCert = keepCertIdx >= 0 ? Number(process.argv[keepCertIdx + 1]) : 1020;

const isTestLead = (firstName: string, lastName: string, email: string) => {
  const blob = `${firstName} ${lastName} ${email}`.toLowerCase();
  return (
    /тест|test|лид с сертификат|dry|qa\b/.test(blob) ||
    email.endsWith("@example.com")
  );
};

async function main() {
  const certs = await db.GiftCertificate.findAll({ order: [["number", "ASC"]] });
  const toDeleteCerts = certs.filter((c) => c.number !== keepCert);
  console.log(`GiftCertificates: keep №${keepCert}, delete ${toDeleteCerts.length}`);
  for (const c of toDeleteCerts) {
    console.log(`  − №${c.number} ${c.electronicCode ?? ""} (${c.status})`);
  }

  const orders = await db.Order.findAll({
    include: [{ model: db.OrderItem, as: "items" }],
    order: [["createdAt", "DESC"]],
  });
  const toDeleteOrders = orders.filter((o) =>
    isTestLead(String(o.firstName), String(o.lastName), String(o.email ?? "")),
  );
  console.log(`Orders: delete ${toDeleteOrders.length} test lead(s)`);
  for (const o of toDeleteOrders) {
    console.log(
      `  − ${o.firstName} ${o.lastName} · ${o.email} · ${String(o.id).slice(0, 8)}`,
    );
  }

  if (dryRun) {
    console.log("\n(dry-run — нічого не видалено)");
    return;
  }

  if (toDeleteCerts.length > 0) {
    await db.GiftCertificate.destroy({
      where: { number: { [Op.ne]: keepCert } },
    });
  }

  for (const order of toDeleteOrders) {
    await db.OrderItem.destroy({ where: { orderId: order.id } });
    await order.destroy();
  }

  console.log("\n✓ Готово.");
}

void main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.sequelize.close());