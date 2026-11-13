import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  calcTailoringEstimate,
  canStartOn,
  formatConvertedPrice,
  pickWorkDays,
  sumWorkDays,
  todayISO,
  type MeasurementType,
} from "@project/shared";
import { useAppSelector } from "../store/store";
import { useAvailability, useWorkDaysTable } from "../api/availabilityApi";

/** "2027-03-22" → localized "22 березня 2027" */
export const useFormatDate = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en-GB" : "uk-UA";

  return useMemo(
    () => (iso: string | null | undefined, withYear = true) => {
      if (!iso) return "";
      const [y, m, d] = iso.split("-").map(Number);
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        ...(withYear ? { year: "numeric" } : {}),
        timeZone: "UTC",
      }).format(new Date(Date.UTC(y, m - 1, d)));
    },
    [locale],
  );
};

/**
 * Price range / prepayment / ready dates for the garments in the tailoring flow.
 * Lines are converted per garment and summed, so everything adds up on screen.
 */
/** "2" / "2–3" days and a single-date-or-range label, shared by all tailoring pages. */
export const useScheduleFormat = () => {
  const { t } = useTranslation();
  const formatDate = useFormatDate();

  return useMemo(
    () => ({
      /** Production time can be fractional (0.25 day) → whole days */
      days: (min: number, max: number) => {
        const a = Math.ceil(min);
        const b = Math.ceil(max);
        return a === b
          ? t("selectType.daysExact", { count: a })
          : t("selectType.days", { min: a, max: b });
      },
      ready: (from: string | null, to: string | null) => {
        if (!from || !to) return "";
        return from === to
          ? formatDate(to)
          : `${formatDate(from, false)} – ${formatDate(to)}`;
      },
    }),
    [t, formatDate],
  );
};

/**
 * Price range / prepayment / ready dates for the garments in the tailoring flow.
 * Lines are converted per garment and summed, so everything adds up on screen.
 * Production time comes from the studio price list (working days) when known.
 */
export const useTailoringEstimate = (typesOverride?: MeasurementType[]) => {
  const storeTypes = useAppSelector((state) => state.tailoring.types);
  const programs = useAppSelector((state) => state.tailoring.programs);
  const currency = useAppSelector((state) => state.currency.code);
  const chosenStart = useAppSelector((state) => state.tailoring.startDate);

  const types = typesOverride ?? storeTypes;

  const workDaysQuery = useWorkDaysTable();
  const workDays = useMemo(
    () => pickWorkDays(workDaysQuery.data, types, programs),
    [workDaysQuery.data, types, programs],
  );
  const totalWorkDays = sumWorkDays(workDays);

  // The start date must leave room for the whole order
  const windowDays = useMemo(
    () => Math.ceil(calcTailoringEstimate(types, "UAH", null).leadDaysMin),
    [types],
  );
  const availability = useAvailability(
    { days: windowDays, workDays: totalWorkDays },
    !workDaysQuery.isLoading,
  );

  const nearestStart = availability.data?.nearestStart ?? null;
  const ranges = availability.data?.ranges;
  const hasCalendar = Boolean(ranges) && availability.data?.source !== "unavailable";

  /** Can the order (whole production window) start on this day? */
  const canSelectStart = useMemo(
    () => (iso: string) =>
      Boolean(ranges) &&
      hasCalendar &&
      iso >= todayISO() &&
      canStartOn(ranges ?? [], iso, windowDays, totalWorkDays),
    [ranges, hasCalendar, windowDays, totalWorkDays],
  );

  // The client's own pick wins while it is still valid; otherwise the nearest start
  const chosenValid = Boolean(chosenStart) && canSelectStart(chosenStart as string);
  const startDate = chosenValid ? (chosenStart as string) : nearestStart;
  const isCustomStart = chosenValid && chosenStart !== nearestStart;

  const estimate = useMemo(
    () => calcTailoringEstimate(types, currency, startDate, workDays),
    [types, currency, startDate, workDays],
  );

  const formatRange = useMemo(
    () => (from: number, to: number) =>
      from === to
        ? formatConvertedPrice(from, currency)
        : `${formatConvertedPrice(from, currency)} – ${formatConvertedPrice(to, currency)}`,
    [currency],
  );

  return {
    estimate,
    formatRange,
    availability,
    types,
    nearestStart,
    canSelectStart,
    isCustomStart,
    workDaysTable: workDaysQuery.data ?? null,
  };
};
