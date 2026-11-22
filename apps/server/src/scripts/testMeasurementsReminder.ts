/**
 * Creates a clearly labelled TEST tailoring lead, moves it through the
 * 30-day measurements reminder path, and prints the cabinet URL.
 *
 *   npx tsx src/scripts/testMeasurementsReminder.ts
 *
 * Safe to delete afterwards via pruneTestData.ts (name contains «Тест»).
 */
import "../loadEnv.js";
import { addDaysISO, todayISO } from "@project/shared";
import db from "../models/index.js";
import { createOrder } from "../services/orderService.js";
import { buildCabinetOrder } from "../utils/cabinet.js";
import { cabinetUrl } from "../utils/links.js";
import { runMeasurementsJob } from "../jobs/measurementsJob.js";
import {
  findProp,
  getSchema,
  notionRequest,
} from "../utils/notionOrders.js";
import { normalizeNotionId } from "../utils/notionAvailability.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const TEST_EMAIL =
  process.env.TEST_EMAIL?.trim() ||
  process.env.EMAIL_REPLY_TO?.trim() ||
  "kiricenkoo182@gmail.com";

if (process.env.CLIENT_URL?.includes("localhost")) {
  process.env.CLIENT_URL = "https://kirich-sewing-studio.com";
}

const waitForNotionPage = async (orderId: string): Promise<string> => {
  for (let i = 0; i < 20; i++) {
    const row = await db.Order.findByPk(orderId);
    const pageId = row?.notionPageId;
    if (pageId && pageId !== "dry-run-page-id") return pageId;
    await sleep(1500);
  }
  throw new Error("Notion page id was not saved on the order in time.");
};

const moveToQueueWithDueDateToday = async (pageId: string) => {
  const dbId = normalizeNotionId(process.env.NOTION_DATABASE_ID);
  if (!dbId) throw new Error("NOTION_DATABASE_ID missing");
  const schema = await getSchema(dbId);
  const statusProp = findProp(schema, ["status"]);
  const periodProp = findProp(
    schema,
    ["date"],
    /термін|дедлайн|deadline|due|виконан/i,
  );
  if (!statusProp || !periodProp) {
    throw new Error("Notion is missing Status or period date.");
  }
  const booked = statusProp.status?.options.find((o) =>
    /в черзі|заброньов|бронь/i.test(o.name),
  );
  if (!booked) {
    throw new Error("Notion has no «В черзі на пошиття» status.");
  }

  const start = addDaysISO(todayISO(), 20);
  const end = addDaysISO(start, 14);
  await notionRequest(`/pages/${pageId}`, {
    method: "PATCH",
    body: {
      properties: {
        [statusProp.name]: { status: { name: booked.name } },
        [periodProp.name]: { date: { start, end } },
      },
    },
  });
  console.log(
    `Notion: status → ${booked.name}, start → ${start} (мірки due ≈ ${addDaysISO(start, -30)})`,
  );
};

const main = async () => {
  console.log(`Test lead email: ${TEST_EMAIL}`);
  console.log(`Cabinet host: ${process.env.CLIENT_URL}`);

  const order = await createOrder({
    orderType: "custom",
    status: "pending",
    totalAmount: 0,
    displayCurrency: "UAH",
    firstName: "Тест",
    lastName: "Мірок",
    phone: "+380508344955",
    email: TEST_EMAIL,
    deliveryMethod: "pickup",
    paymentMethod: "online",
    communicationMethod: "telegram",
    socialUsername: "@kiricholeg5",
    comment:
      "ТЕСТ системи мірок (лист за 30 днів + бланк у кабінеті). Можна скасувати.",
    measurements: { unit: "cm", values: {} },
    tailoringTypes: ["body"],
    tailoringQuantities: { body: 1 },
    tailoringPrograms: { body: "ST" },
    tailoringCategory: "competition",
    tailoringOrderProgram: "ST",
    tailoringLines: [{ productId: "competition.st.body", quantity: 1 }],
    preferredStartDate: "2027-06-01",
    items: [
      {
        productId: null,
        name: "Індивідуальне пошиття: body",
        quantity: 1,
        price: 0,
      },
    ],
  });

  console.log(`Order id: ${order.id}`);
  console.log(`Access token: ${order.accessToken}`);

  const pageId = await waitForNotionPage(order.id);
  console.log(`Notion page: ${pageId}`);

  await moveToQueueWithDueDateToday(pageId);
  await sleep(1500);

  const job = await runMeasurementsJob();
  console.log(`Measurements job: found=${job.found} moved=${job.moved}`);

  const fresh = await db.Order.findByPk(order.id);
  if (!fresh) throw new Error("Order disappeared");
  const cabinet = await buildCabinetOrder(fresh);

  console.log(`Cabinet stage: ${cabinet.stage}`);
  console.log(`Measurements needed: ${cabinet.measurements.needed}`);
  console.log(`Measurements submitted: ${cabinet.measurements.submitted}`);
  console.log(`Cabinet: ${cabinetUrl(String(fresh.accessToken))}`);

  if (!cabinet.measurements.needed) {
    console.warn(
      "Бланк ще не відкрився — перевір статус у Notion («Планове зняття мірок»).",
    );
    process.exitCode = 1;
  }

  await db.sequelize.close();
};

main().catch(async (error) => {
  console.error(error);
  await db.sequelize.close().catch(() => {});
  process.exit(1);
});
