import "../loadEnv.js";
import db from "../models/index.js";

const main = async () => {
  const rows = await db.GiftCertificate.findAll({
    attributes: ["id", "number", "buyerLabel", "purchasedAt"],
    order: [["number", "ASC"]],
  });

  if (rows.length === 0) {
    console.log("GiftCertificates: таблиця вже порожня.");
    await db.sequelize.close();
    return;
  }

  console.log("Видаляємо:");
  for (const row of rows) {
    const j = row.toJSON();
    console.log(`  №${j.number} · ${j.buyerLabel} (${j.purchasedAt})`);
  }

  const deleted = await db.GiftCertificate.destroy({ where: {} });
  console.log(`Готово. Видалено: ${deleted}. Наступний номер знову буде 1021.`);
  await db.sequelize.close();
};

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});