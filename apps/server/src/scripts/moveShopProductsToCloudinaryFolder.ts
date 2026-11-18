/**
 * Moves product images from Cloudinary root → shop_products/ and updates Neon URLs.
 *
 *   npx tsx src/scripts/moveShopProductsToCloudinaryFolder.ts --dry-run
 *   npx tsx src/scripts/moveShopProductsToCloudinaryFolder.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_SHOP_PRODUCTS_FOLDER,
  migrateShopImageUrl,
  shopProductImageCandidates,
} from "@project/shared";
import "../loadEnv.js";
import db from "../models/index.js";
import { isCloudinaryConfigured } from "../utils/cloudinaryClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes("--dry-run");

const HOME_ROOT_FILES = [
  "3042-1.jpg",
  "3033.jpg",
  "3080.jpg",
  "3081.jpg",
  "3013.jpg",
  "3082.jpg",
  "default.jpg",
];

const publicIdFromFilename = (filename: string): string =>
  filename.replace(/\.jpg$/i, "");

function collectTargetFilenames(): Set<string> {
  const jsonPath = path.resolve(__dirname, "../../products.json");
  const products = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Array<{
    product_code: string;
  }>;
  const names = new Set<string>(HOME_ROOT_FILES);
  for (const p of products) {
    for (const file of shopProductImageCandidates(p.product_code)) {
      names.add(file);
    }
  }
  return names;
}

const resourceExists = async (publicId: string): Promise<boolean> => {
  try {
    await cloudinary.api.resource(publicId, { resource_type: "image" });
    return true;
  } catch {
    return false;
  }
};

async function renameAsset(fromPublicId: string, toPublicId: string) {
  if (dryRun) {
    console.log(`[dry-run] rename ${fromPublicId} → ${toPublicId}`);
    return "dry";
  }
  try {
    await cloudinary.uploader.rename(fromPublicId, toPublicId, {
      overwrite: false,
      invalidate: true,
    });
    return "moved";
  } catch (error: any) {
    const msg = String(error?.message ?? error);
    if (/not found/i.test(msg)) return "missing";
    if (/already exists|Resource with the given public ID already exists/i.test(msg)) {
      return "exists";
    }
    throw error;
  }
}

async function main() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!.trim(),
    api_key: process.env.CLOUDINARY_API_KEY!.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET!.trim(),
    secure: true,
  });

  const filenames = collectTargetFilenames();
  let moved = 0;
  let skipped = 0;
  let missing = 0;

  for (const filename of filenames) {
    const base = publicIdFromFilename(filename);
    const from = base;
    const to = `${CLOUDINARY_SHOP_PRODUCTS_FOLDER}/${base}`;

    if (await resourceExists(to)) {
      skipped++;
      continue;
    }

    const result = await renameAsset(from, to);
    if (result === "moved" || result === "dry") moved++;
    else if (result === "missing") {
      missing++;
      console.log(`⚠️ немає ні в корені, ні в shop_products: ${base}`);
    } else {
      skipped++;
    }
  }

  console.log(
    `\nCloudinary: перенесено ${moved}, вже в shop_products ${skipped}, відсутні ${missing}`,
  );

  if (dryRun) {
    console.log("(dry-run — БД не оновлювалась)");
    return;
  }

  const products = await db.Product.findAll();
  let updated = 0;
  for (const row of products) {
    const urls = Array.isArray(row.imageUrl) ? row.imageUrl : [];
    const next = urls.map((u) => migrateShopImageUrl(String(u)));
    const changed = next.some((u, i) => u !== urls[i]);
    if (changed) {
      await row.update({ imageUrl: next });
      updated++;
    }
  }
  console.log(`✓ Оновлено imageUrl у ${updated} товарів у БД`);

  console.log(
    "\nДалі для папки в Media Library (як measurements_photos):",
    "npx tsx src/scripts/assignShopProductsAssetFolder.ts",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.sequelize.close());