import "../loadEnv.js";
import { v2 as cloudinary } from "cloudinary";
import { isCloudinaryConfigured } from "../utils/cloudinaryClient.js";

async function list(prefix: string, max = 15) {
  const r = await cloudinary.api.resources({
    type: "upload",
    prefix,
    max_results: max,
  });
  console.log(`\n=== prefix="${prefix || "(root)"}" total=${r.total_count ?? "?"} ===`);
  for (const x of r.resources ?? []) {
    console.log(`  ${x.public_id}  (${x.bytes} bytes)`);
  }
}

async function probe(publicId: string) {
  try {
    const r = await cloudinary.api.resource(publicId, { resource_type: "image" });
    console.log(
      `FOUND ${publicId} → folder=${(r as { asset_folder?: string }).asset_folder ?? "?"} url=${r.secure_url}`,
    );
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!isCloudinaryConfigured()) throw new Error("No Cloudinary creds");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!.trim(),
    api_key: process.env.CLOUDINARY_API_KEY!.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET!.trim(),
    secure: true,
  });

  console.log("cloud:", process.env.CLOUDINARY_CLOUD_NAME);
  for (const id of [
    "3010",
    "shop_products/3010",
    "3013",
    "shop_products/3013",
    "default",
    "shop_products/default",
  ]) {
    await probe(id);
  }
  const meas = await cloudinary.api.resources({
    type: "upload",
    prefix: "measurements_photos",
    max_results: 1,
  });
  if (meas.resources?.[0]) {
    console.log(
      "\nmeasurements sample:",
      JSON.stringify(meas.resources[0], null, 2),
    );
  }
  await list("");
  await list("shop_products/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});