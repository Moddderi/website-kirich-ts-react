/**
 * Client cabinet: stages of an individual tailoring order. The studio works in
 * Notion — its «Status» is mapped onto these stages (see server/utils/cabinet.ts).
 */
export const CABINET_STAGES = [
  "new", // Нове замовлення — заявку прийнято
  "awaiting_prepayment", // Очікує передплати
  "booked", // Заброньовано — чекаємо дати
  "measurements", // Планове зняття мірок
  "in_progress", // В роботі
  "fitting", // Чекає примірки
  "awaiting_payment", // Очікує розрахунку
  "ready", // Готове до відправлення / видачі
  "done", // Відправлено / видано
] as const;

export type CabinetStage = (typeof CABINET_STAGES)[number];

export interface CabinetOrder {
  /** short public number: Notion number or the first block of the order id */
  number: string;
  firstName: string;
  createdAt: string;
  stage: CabinetStage;
  garments: Array<{ type: string; program: "ST" | "LAT" }>;
  dates: {
    start: string | null;
    readyTo: string | null;
    measurementsDue: string | null;
  };
  measurements: {
    /** the order is waiting for the client's measurements now */
    needed: boolean;
    submitted: boolean;
  };
  /** false → status comes from the website only (Notion unavailable) */
  live: boolean;
}
