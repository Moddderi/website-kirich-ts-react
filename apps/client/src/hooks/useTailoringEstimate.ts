import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  calcTailoringEstimate,
  calcTailoringLinesEstimate,
  canStartOn,
  expandTailoringTypes,
  formatConvertedPrice,
  linesToMeasurementTypes,
  pickWorkDays,
  sumWorkDaysForSelection,
  todayISO,
  type MeasurementType,
} from "@project/shared";
import { useAppSelector } from "../store/store";
import {
  useAvailability,
  useCatalogLeadDays,
  useWorkDaysTable,
} from "../api/availabilityApi";

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
 * Uses the fixed catalog when `lines` are set; otherwise legacy garment cards.
 */
export const useTailoringEstimate = (typesOverride?: MeasurementType[]) => {
  const storeTypes = useAppSelector((state) => state.tailoring.types);
  const lines = useAppSelector((state) => state.tailoring.lines);
  const quantities = useAppSelector((state) => state.tailoring.quantities);
  const programs = useAppSelector((state) => state.tailoring.programs);
  const currency = useAppSelector((state) => state.currency.code);
  const chosenStart = useAppSelector((state) => state.tailoring.startDate);

  const types = typesOverride ?? storeTypes;
  const useCatalog = lines.length > 0;

  const expandedTypes = useMemo(
    () =>
      useCatalog
        ? linesToMeasurementTypes(lines)
        : expandTailoringTypes(types, quantities),
    [useCatalog, lines, types, quantities],
  );

  const catalogLeadDaysQuery = useCatalogLeadDays();
  const catalogLeadDays = catalogLeadDaysQuery.data ?? null;

  const workDaysQuery = useWorkDaysTable();
  const workDays = useMemo(
    () =>
      useCatalog
        ? null
        : pickWorkDays(workDaysQuery.data, types, programs),
    [useCatalog, workDaysQuery.data, types, programs],
  );

  const catalogPreview = useMemo(
    () =>
      useCatalog
        ? calcTailoringLinesEstimate(lines, "UAH", null, catalogLeadDays)
        : null,
    [useCatalog, lines, catalogLeadDays],
  );

  const totalWorkDays = useCatalog
    ? catalogPreview?.leadDaysMin ?? null
    : sumWorkDaysForSelection(
        workDaysQuery.data,
        types,
        programs,
        quantities,
      );

  const legacyWindow = useMemo(
    () => Math.ceil(calcTailoringEstimate(expandedTypes, "UAH", null).leadDaysMin),
    [expandedTypes],
  );
  const windowDays = useCatalog
    ? Math.ceil(catalogPreview?.leadDaysMin ?? legacyWindow)
    : legacyWindow;

  const availability = useAvailability(
    { days: windowDays, workDays: totalWorkDays },
    !workDaysQuery.isLoading && !catalogLeadDaysQuery.isLoading,
  );

  const nearestStart = availability.data?.nearestStart ?? null;
  const ranges = availability.data?.ranges;
  const hasCalendar = Boolean(ranges) && availability.data?.source !== "unavailable";

  const canSelectStart = useMemo(
    () => (iso: string) =>
      Boolean(ranges) &&
      hasCalendar &&
      iso >= todayISO() &&
      canStartOn(ranges ?? [], iso, windowDays, totalWorkDays),
    [ranges, hasCalendar, windowDays, totalWorkDays],
  );

  const chosenValid = Boolean(chosenStart) && canSelectStart(chosenStart as string);
  const startDate = chosenValid ? (chosenStart as string) : nearestStart;
  const isCustomStart = chosenValid && chosenStart !== nearestStart;

  const estimate = useMemo(
    () =>
      useCatalog
        ? calcTailoringLinesEstimate(
            lines,
            currency,
            startDate,
            catalogLeadDays,
          )
        : calcTailoringEstimate(expandedTypes, currency, startDate, workDays),
    [useCatalog, lines, expandedTypes, currency, startDate, workDays, catalogLeadDays],
  );

  const { t } = useTranslation();

  /** Show only the lower bound, with «від» / «from». */
  const formatRange = useMemo(
    () => (_from: number, to?: number) => {
      const from = _from;
      void to;
      return t("pricing.from", {
        price: formatConvertedPrice(from, currency),
      });
    },
    [currency, t],
  );

  return {
    estimate,
    formatRange,
    availability,
    types,
    lines,
    useCatalog,
    nearestStart,
    canSelectStart,
    isCustomStart,
    workDaysTable: workDaysQuery.data ?? null,
    catalogLeadDays: catalogLeadDays ?? {},
  };
};