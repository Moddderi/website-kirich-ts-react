import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import {
  getStatusForDate,
  todayISO,
  type AvailabilityRange,
  type AvailabilityStatus,
} from "@project/shared";

interface StudioCalendarProps {
  ranges: AvailabilityRange[];
  nearestStart: string | null;
  /** Earliest / latest estimated ready date of the client's order */
  readyFrom?: string | null;
  readyTo?: string | null;
}

const MONTHS_AHEAD = 18;

const pad = (n: number) => String(n).padStart(2, "0");
const monthKey = (year: number, month: number) => `${year}-${pad(month + 1)}`;
const daysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

const STATUS_STYLES: Record<AvailabilityStatus, string> = {
  free: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
  limited: "bg-amber-50 text-amber-800 border-amber-200/80",
  busy: "bg-stone-100 text-stone-400 border-stone-200/60",
};

/** Day off (Sat/Sun): muted cell crossed out by two diagonals. */
const WEEKEND_STYLE = "bg-stone-50 text-stone-400 border-stone-200/70";
const CROSS_BG =
  "linear-gradient(to top right, transparent calc(50% - 0.75px), rgba(168,162,158,0.7) 50%, transparent calc(50% + 0.75px)), linear-gradient(to bottom right, transparent calc(50% - 0.75px), rgba(168,162,158,0.7) 50%, transparent calc(50% + 0.75px))";

const DOT_STYLES: Record<AvailabilityStatus, string> = {
  free: "bg-emerald-400",
  limited: "bg-amber-400",
  busy: "bg-stone-300",
};

/** The client's own order: from start day to the latest estimated ready day. */
const WORK_STYLE = "bg-stone-900 text-white border-stone-900";

export const StudioCalendar = ({
  ranges,
  nearestStart,
  readyFrom = null,
  readyTo = null,
}: StudioCalendarProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en-GB" : "uk-UA";
  const today = todayISO();

  const base = new Date(`${today}T00:00:00Z`);
  const baseYear = base.getUTCFullYear();
  const baseMonth = base.getUTCMonth();

  const startAnchor = nearestStart ?? today;
  const [cursor, setCursor] = useState(() => {
    const d = new Date(`${startAnchor}T00:00:00Z`);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
  });

  const months = useMemo(
    () =>
      Array.from({ length: MONTHS_AHEAD }, (_, i) => {
        const index = baseMonth + i;
        return {
          year: baseYear + Math.floor(index / 12),
          month: index % 12,
        };
      }),
    [baseYear, baseMonth],
  );

  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    [locale],
  );
  const monthShortFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        timeZone: "UTC",
      }),
    [locale],
  );
  const weekdayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }),
    [locale],
  );

  // 2024-01-01 is a Monday → Monday-first header
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    weekdayFormatter.format(new Date(Date.UTC(2024, 0, 1 + i))),
  );

  const monthStatus = (year: number, month: number): AvailabilityStatus => {
    const total = daysInMonth(year, month);
    let open = 0;
    let counted = 0;

    for (let day = 1; day <= total; day++) {
      const iso = `${monthKey(year, month)}-${pad(day)}`;
      if (iso < today) continue;
      counted++;
      if (getStatusForDate(ranges, iso).status !== "busy") open++;
    }

    if (counted === 0 || open === 0) return "busy";
    return open / counted < 0.4 ? "limited" : "free";
  };

  const { year, month } = cursor;
  const total = daysInMonth(year, month);
  const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  const cursorIndex = months.findIndex(
    (m) => m.year === year && m.month === month,
  );
  const canPrev = cursorIndex > 0;
  const canNext = cursorIndex !== -1 && cursorIndex < months.length - 1;

  const move = (delta: number) => {
    const target = months[cursorIndex + delta];
    if (target) setCursor(target);
  };

  /** Is the day inside the client's own order (approximate production period)? */
  const isInOrder = (iso: string) => {
    const end = readyTo ?? readyFrom;
    return Boolean(nearestStart && end && iso >= nearestStart && iso <= end);
  };

  // "Few slots" only matters when the owner actually uses it (Google Sheet rows)
  const hasLimited = ranges.some((range) => range.status === "limited");

  const statusLabel: Record<AvailabilityStatus, string> = {
    free: t("availability.legendFree"),
    limited: t("availability.legendLimited"),
    busy: t("availability.legendBusy"),
  };

  return (
    <div className="space-y-8">
      {/* Months overview */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
          {t("availability.monthsOverview")}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {months.map((m) => {
            const status = monthStatus(m.year, m.month);
            const active = m.year === year && m.month === month;
            return (
              <button
                key={monthKey(m.year, m.month)}
                type="button"
                onClick={() => setCursor(m)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                  active
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${DOT_STYLES[status]}`} />
                <span className="capitalize">
                  {monthShortFormatter.format(
                    new Date(Date.UTC(m.year, m.month, 1)),
                  )}
                  {m.month === 0 || m === months[0]
                    ? ` ’${String(m.year).slice(2)}`
                    : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Month grid */}
      <div className="rounded-4xl border border-stone-200/60 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={!canPrev}
            aria-label={t("availability.prevMonth")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 text-stone-600 transition-all hover:border-stone-900 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-30"
          >
            <HiOutlineArrowLeft size={18} />
          </button>

          <h3 className="text-lg font-semibold capitalize tracking-tight text-stone-900">
            {monthFormatter.format(new Date(Date.UTC(year, month, 1)))}
          </h3>

          <button
            type="button"
            onClick={() => move(1)}
            disabled={!canNext}
            aria-label={t("availability.nextMonth")}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 text-stone-600 transition-all hover:border-stone-900 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-30"
          >
            <HiOutlineArrowRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekdays.map((name) => (
            <div
              key={name}
              className="pb-1 text-center text-[10px] font-semibold uppercase tracking-widest text-stone-400"
            >
              {name}
            </div>
          ))}

          {cells.map((day, index) => {
            if (day === null) return <div key={`empty-${index}`} />;

            const iso = `${monthKey(year, month)}-${pad(day)}`;
            const { status, note } = getStatusForDate(ranges, iso);
            const isPast = iso < today;
            // Sat/Sun are non-working days → never painted as "in production"
            // (grid is Monday-first, `index` includes the leading empty cells).
            const isWeekend = index % 7 >= 5;
            const inOrder = !isPast && !isWeekend && isInOrder(iso);

            return (
              <div
                key={iso}
                title={
                  isWeekend
                    ? t("availability.legendWeekend")
                    : inOrder
                      ? t("availability.legendWork")
                      : note || statusLabel[status]
                }
                className={`relative flex aspect-square items-center justify-center rounded-xl border text-xs font-semibold transition-colors sm:text-sm ${
                  isPast
                    ? "border-transparent bg-transparent text-stone-300"
                    : isWeekend
                      ? WEEKEND_STYLE
                      : inOrder
                        ? WORK_STYLE
                        : STATUS_STYLES[status]
                }`}
                style={
                  !isPast && isWeekend ? { backgroundImage: CROSS_BG } : undefined
                }
              >
                <span className="relative rounded-sm bg-inherit px-0.5">{day}</span>
              </div>
            );
          })}
        </div>

        {/* Legend: free / busy / client's own order timeline */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-stone-500">
          {(["free", ...(hasLimited ? (["limited"] as const) : []), "busy"] as const).map(
            (status) => (
              <span key={status} className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-md border ${STATUS_STYLES[status]}`}
                />
                {statusLabel[status]}
              </span>
            ),
          )}
          <span className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-md border ${WEEKEND_STYLE}`}
              style={{ backgroundImage: CROSS_BG }}
            />
            {t("availability.legendWeekend")}
          </span>
          {nearestStart && (readyTo ?? readyFrom) && (
            <span className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-md border ${WORK_STYLE}`} />
              {t("availability.legendWork")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
