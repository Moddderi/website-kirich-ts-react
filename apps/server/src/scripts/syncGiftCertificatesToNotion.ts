import "../loadEnv.js";
import db from "../models/index.js";
import { createNotionGiftCertificate } from "../utils/notionCertificates.js";
import { generateElectronicCertificateCode } from "../utils/certificateCode.js";

const main = async () => {
  const certs = await db.GiftCertificate.findAll({
    where: {},
    order: [["number", "ASC"]],
  });

  if (certs.length === 0) {
    console.log("У БД немає сертифікатів для синхронізації.");
    await db.sequelize.close();
    return;
  }

  for (const cert of certs) {
    if (cert.notionPageId && cert.notionPageId !== "dry-run-page-id") {
      console.log(`№${cert.number}: вже є notionPageId, пропуск.`);
      continue;
    }

    let electronicCode = cert.electronicCode;
    if (!electronicCode) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const candidate = generateElectronicCertificateCode();
        try {
          await cert.update({ electronicCode: candidate });
          electronicCode = candidate;
          console.log(`№${cert.number}: згенеровано електронний код ${candidate}`);
          break;
        } catch {
          /* unique collision */
        }
      }
      if (!electronicCode) {
        console.log(`№${cert.number}: не вдалося згенерувати electronicCode, пропуск.`);
        continue;
      }
    }

    const notion = await createNotionGiftCertificate({
      number: cert.number,
      electronicCode,
      amountUah: Number(cert.amountUah),
      buyerLabel: cert.buyerLabel,
      purchasedAt: cert.purchasedAt,
      validUntil: cert.validUntil,
      purchaserFirstName: cert.purchaserFirstName,
      purchaserLastName: cert.purchaserLastName,
      purchaserPhone: cert.purchaserPhone,
      purchaserEmail: cert.purchaserEmail,
      comment: cert.comment,
      physicalDelivery:
        cert.requestPhysicalDelivery && cert.deliveryMethod
          ? {
              method: cert.deliveryMethod as "nova_poshta" | "ukrposhta" | "pickup",
              city: cert.deliveryCity,
              warehouse: cert.deliveryWarehouse,
            }
          : null,
    });

    if (notion?.id) {
      await cert.update({ notionPageId: notion.id });
      console.log(`№${cert.number}: Notion OK → ${notion.url ?? notion.id}`);
    } else {
      console.log(`№${cert.number}: Notion не створено.`);
    }
  }

  await db.sequelize.close();
};

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});