import "../loadEnv.js";
import db from "../models/index.js";
import { generateElectronicCertificateCode } from "../utils/certificateCode.js";

const main = async () => {
  const certs = await db.GiftCertificate.findAll({
    where: {},
    order: [["number", "ASC"]],
  });

  for (const cert of certs) {
    if (cert.electronicCode) {
      console.log(`№${cert.number}: ${cert.electronicCode}`);
      continue;
    }
    let saved: string | null = null;
    for (let attempt = 0; attempt < 12; attempt++) {
      const candidate = generateElectronicCertificateCode();
      try {
        await cert.update({ electronicCode: candidate });
        saved = candidate;
        break;
      } catch {
        /* unique collision */
      }
    }
    console.log(
      saved
        ? `№${cert.number}: згенеровано ${saved}`
        : `№${cert.number}: помилка генерації`,
    );
  }

  await db.sequelize.close();
};

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});