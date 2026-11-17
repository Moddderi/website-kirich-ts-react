import dotenv from "dotenv";

dotenv.config();

const { syncCatalogLeadDaysFromNotion } = await import(
  "../utils/catalogLeadDaysStore.js"
);

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