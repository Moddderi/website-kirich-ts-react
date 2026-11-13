import { todayISO } from "@project/shared";
import db from "../models/index.js";
import { isNotionConfigured, normalizeNotionId } from "../utils/notionAvailability.js";
import { findProp, getSchema, notionRequest } from "../utils/notionOrders.js";
import { notifyMeasurementsRequested } from "../utils/measurementsReminder.js";

/**
 * Daily job: website bookings whose «Дата зняття мірок» (start − 30 days) has
 * come and that are still «Заброньовано» →
 *   1. Notion status becomes «Планове зняття мірок»,
 *   2. the studio gets a Telegram message, the client an e-mail,
 *   3. the cabinet opens the measurements form (it reads the same status).
 *
 * Cheap by design: ONE Notion query per run; the database is only touched
 * when something actually has to be moved (Neon can stay asleep).
 * Idempotent: a moved order no longer matches the query.
 */
export const runMeasurementsJob = async (): Promise<{
  found: number;
  moved: number;
}> => {
  if (!isNotionConfigured()) return { found: 0, moved: 0 };

  const ordersDbId = normalizeNotionId(process.env.NOTION_DATABASE_ID);
  if (!ordersDbId) return { found: 0, moved: 0 };

  const schema = await getSchema(ordersDbId);
  const statusProp = findProp(schema, ["status"]);
  const dueProp = findProp(schema, ["formula"], /мірок|measure/i);
  const sourceProp = findProp(schema, ["select"], /місце замовлення|джерело|source/i);
  if (!statusProp || !dueProp) {
    console.warn("⚠️ Задача мірок: у Notion немає Status або «Дата зняття мірок».");
    return { found: 0, moved: 0 };
  }

  const options = statusProp.status?.options ?? [];
  const booked = options.find((o) => /заброньов|бронь/i.test(o.name));
  const measuring = options.find((o) => /зняття мірок/i.test(o.name));
  if (!booked || !measuring) {
    console.warn("⚠️ Задача мірок: немає статусів «Заброньовано» / «Планове зняття мірок».");
    return { found: 0, moved: 0 };
  }

  const filters: unknown[] = [
    { property: statusProp.name, status: { equals: booked.name } },
    { property: dueProp.name, formula: { date: { on_or_before: todayISO() } } },
  ];
  // Only orders that came from the website have a cabinet / e-mail flow
  const siteOption = sourceProp?.select?.options.find((o) => /сайт|site|web/i.test(o.name));
  if (sourceProp && siteOption) {
    filters.push({ property: sourceProp.name, select: { equals: siteOption.name } });
  }

  const res = await notionRequest<{ results: Array<{ id: string }> }>(
    `/databases/${ordersDbId}/query`,
    { body: { page_size: 25, filter: { and: filters } } },
  );

  let moved = 0;
  for (const page of res.results) {
    try {
      await notionRequest(`/pages/${page.id}`, {
        method: "PATCH",
        body: { properties: { [statusProp.name]: { status: { name: measuring.name } } } },
      });
      moved++;

      const order: any = await db.Order.findOne({ where: { notionPageId: page.id } });
      if (order && !order.measurementsRequestedAt) {
        await order.update({ measurementsRequestedAt: new Date() });
        await notifyMeasurementsRequested(order.toJSON());
      }
    } catch (error) {
      console.error(`❌ Задача мірок: сторінка ${page.id}:`, error);
    }
  }

  if (res.results.length > 0) {
    console.log(`✂️ Задача мірок: знайдено ${res.results.length}, переведено ${moved}`);
  }
  return { found: res.results.length, moved };
};
