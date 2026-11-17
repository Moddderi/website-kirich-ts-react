import { isCurrency, type Currency } from "@project/shared";

export type EmailLang = "uk" | "en";

export const emailLang = (order: { displayCurrency?: unknown }): EmailLang => {
  const c: Currency = isCurrency(order.displayCurrency)
    ? order.displayCurrency
    : "UAH";
  return c === "UAH" ? "uk" : "en";
};

export const EMAIL_COPY: Record<
  EmailLang,
  {
    htmlLang: string;
    studioTag: string;
    footerCity: string;
    footerHelp: string;
    customSubject: (n: string) => string;
    readySubject: (n: string) => string;
    customTitle: (n: string) => string;
    greeting: string;
    customIntro: (n: string, via: string, handle: string) => string;
    cabinetBlurb: string;
    cabinetBtn: string;
    garments: string;
    estimate: string;
    prepayment: (pct: number) => string;
    accessoriesNote: string;
    start: string;
    ready: string;
    estimateNote: string;
    comment: string;
    measurements: string;
    measurementsPending: string;
    measurementsManager: string;
    units: string;
    delivery: string;
    city: string;
    warehouse: string;
    pickup: string;
    total: string;
    reminderTitle: string;
    reminderGreeting: (name: string) => string;
    reminderBody: string;
    reminderBtn: string;
  }
> = {
  uk: {
    htmlLang: "uk",
    studioTag: "K.I.RICH&nbsp;&nbsp;·&nbsp;&nbsp;Sewing Studio",
    footerCity: "Poltava, Ukraine",
    footerHelp:
      "Якщо у вас є питання — просто дайте відповідь на цей лист<br />або напишіть на",
    customSubject: (n) => `K.I.RICH — запит на пошиття № ${n}`,
    readySubject: (n) => `K.I.RICH — замовлення № ${n} підтверджено`,
    customTitle: (n) => `Запит на пошиття № ${n} прийнято`,
    greeting: "Вітаємо",
    customIntro: (n, via, handle) =>
      `Ваш запит на індивідуальне пошиття <strong style="color:#f4f4f5;">№ ${n}</strong> успішно прийнято. Менеджер зв’яжеться з вами через <strong style="color:#f4f4f5;">${via}</strong>${handle} для уточнення деталей, точної вартості та суми передоплати.`,
    cabinetBlurb:
      "Слідкуйте за статусом замовлення, датою старту та мірками в особистому кабінеті — реєстрація не потрібна.",
    cabinetBtn: "Відкрити кабінет замовлення",
    garments: "Обрані вироби",
    estimate: "Орієнтовна вартість",
    prepayment: (pct) => `Передоплата ${pct}%`,
    accessoriesNote:
      "Готові аксесуари оплачуються повністю і вже входять у суму передплати.",
    start: "Початок роботи",
    ready: "Орієнтовна готовність",
    estimateNote:
      "Це орієнтовні значення. Точну вартість, суму передоплати та терміни менеджер підтвердить після зв’язку з вами.",
    comment: "Ваш коментар",
    measurements: "Ваші мірки",
    measurementsPending:
      "Мірки знімемо ближче до початку: за 30 днів ми нагадаємо, а в особистому кабінеті з’явиться бланк для актуальних мірок.",
    measurementsManager: "Мірки будуть уточнені менеджером особисто.",
    units: "Одиниці виміру",
    delivery: "Доставка",
    city: "Місто",
    warehouse: "Відділення",
    pickup: "Самовивіз із студії",
    total: "Всього",
    reminderTitle: "Час зняти мірки",
    reminderGreeting: (name) => `Вітаємо, <strong>${name}</strong>!`,
    reminderBody:
      "Наближається початок пошиття вашого замовлення. Щоб почати вчасно, потрібні актуальні мірки — заповніть бланк в особистому кабінеті.",
    reminderBtn: "Заповнити мірки",
  },
  en: {
    htmlLang: "en",
    studioTag: "K.I.RICH&nbsp;&nbsp;·&nbsp;&nbsp;Sewing Studio",
    footerCity: "Poltava, Ukraine",
    footerHelp:
      "Questions? Reply to this email or write to",
    customSubject: (n) => `K.I.RICH — tailoring request #${n}`,
    readySubject: (n) => `K.I.RICH — order #${n} confirmed`,
    customTitle: (n) => `Tailoring request #${n} received`,
    greeting: "Hello",
    customIntro: (n, via, handle) =>
      `Your bespoke tailoring request <strong style="color:#f4f4f5;">#${n}</strong> has been received. Our manager will contact you via <strong style="color:#f4f4f5;">${via}</strong>${handle} to confirm details, the exact price and prepayment amount.`,
    cabinetBlurb:
      "Track your order status, start date and measurements in your personal cabinet — no sign-up required.",
    cabinetBtn: "Open order cabinet",
    garments: "Selected garments",
    estimate: "Estimated price",
    prepayment: (pct) => `Prepayment ${pct}%`,
    accessoriesNote:
      "In-stock accessories are paid in full and are already included in the prepayment.",
    start: "Work starts",
    ready: "Estimated completion",
    estimateNote:
      "These figures are indicative. Your manager will confirm the exact price, prepayment and timeline after contacting you.",
    comment: "Your note",
    measurements: "Your measurements",
    measurementsPending:
      "We will ask for measurements closer to the start date — about 30 days before, you will receive a reminder and a form in your cabinet.",
    measurementsManager: "Measurements will be confirmed with your manager personally.",
    units: "Units",
    delivery: "Delivery",
    city: "City",
    warehouse: "Branch",
    pickup: "Studio pickup in Poltava",
    total: "Total",
    reminderTitle: "Time to take measurements",
    reminderGreeting: (name) => `Hello, <strong>${name}</strong>!`,
    reminderBody:
      "Your order start date is coming up. To begin on time we need up-to-date measurements — please fill in the form in your personal cabinet.",
    reminderBtn: "Fill in measurements",
  },
};