/**
 * Dynamic folder mode: files must have asset_folder=shop_products (like measurements_photos),
 * not only public_id shop_products/….
 *
 *   npx tsx src/scripts/assignShopProductsAssetFolder.ts --dry-run
 */
import "../loadEnv.js";
import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_SHOP_PRODUCTS_FOLDER } from "@project/shared";
import { isCloudinaryConfigured } from "../utils/cloudinaryClient.js";

const dryRun = process.argv.includes("--dry-run");
const FOLDER = CLOUDINARY_SHOP_PRODUCTS_FOLDER;

const isShopPublicId = (id: string) =>
  /^(default|\d{4}(-\d+)?)$/.test(id) ||
  id.startsWith(`${FOLDER}/`);

async function listShopCatalogPublicIds(): Promise<string[]> {
  const ids = new Set<string>();
  let cursor: string | undefined;
  do {
    const res = await cloudinary.api.resources({
      type: "upload",
      max_results: 500,
      ...(cursor ? { next_cursor: cursor } : {}),
    });
    for (const r of res.resources ?? []) {
      const id = r.public_id as string;
      if (!id || id.includes("/")) {
        if (id.startsWith(`${FOLDER}/`)) ids.add(id);
        continue;
      }
      if (isShopPublicId(id)) ids.add(id);
    }
    cursor = res.next_cursor ?? undefined;
  } while (cursor);
  return [...ids];
}

async function assignFolder(publicId: string) {
  const meta = await cloudinary.api.resource(publicId);
  const current = (meta as { asset_folder?: string }).asset_folder ?? "";
  if (current === FOLDER) return "already" as const;
  if (dryRun) return "dry" as const;
  await cloudinary.api.update(publicId, { asset_folder: FOLDER });
  return "updated" as const;
}

async function main() {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary env missing");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!.trim(),
    api_key: process.env.CLOUDINARY_API_KEY!.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET!.trim(),
    secure: true,
  });

  try {
    const inFolder = await cloudinary.api.resources_by_asset_folder(FOLDER, {
      max_results: 3,
    });
    console.log(
      `already in asset_folder="${FOLDER}": ${inFolder.resources?.length ?? 0} (sample)`,
    );
  } catch (e) {
    console.log("by_asset_folder probe:", e);
  }

  const publicIds = await listShopCatalogPublicIds();
  console.log(`товарні public_id (корінь + ${FOLDER}/): ${publicIds.length}`);

  let updated = 0;
  let already = 0;

  for (const publicId of publicIds) {
    const result = await assignFolder(publicId);
    if (result === "already") already++;
    else if (result === "dry") {
      console.log(`[dry-run] ${publicId} → asset_folder ${FOLDER}`);
      updated++;
    } else {
      updated++;
      if (updated % 20 === 0) console.log(`… ${updated} оновлено`);
    }
  }

  console.log(
    `\n✓ asset_folder="${FOLDER}": оновлено ${updated}, вже було ${already}, всього ${publicIds.length}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});