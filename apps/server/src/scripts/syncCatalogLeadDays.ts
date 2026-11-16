import dotenv from "dotenv";
import { syncCatalogLeadDaysFromNotion } from "../utils/catalogLeadDaysStore.js";

dotenv.config();

const main = async () => {
  const data = await syncCatalogLeadDaysFromNotion();
  if (!data) {
    console.error("Sync failed (Notion not configured or price DB unreachable)");
    process.exit(1);
  }
  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});