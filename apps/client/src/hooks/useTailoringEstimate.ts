import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  calcTailoringEstimate,
  formatConvertedPrice,
  type MeasurementType,
} from "@project/shared";
import { useAppSelector } from "../store/store";
import { useAvailability } from "../api/availabilityApi";

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
export const useTailoringEstimate = (typesOverride?: MeasurementType[]) => {
  const storeTypes = useAppSelector((state) => state.tailoring.types);
  const currency = useAppSelector((state) => state.currency.code);
  const types = typesOverride ?? storeTypes;

  // The start date must leave room for the whole order (shortest lead time)
  const windowDays = useMemo(
    () => calcTailoringEstimate(types, "UAH", null).leadDaysMin,
    [types],
  );
  const availability = useAvailability(windowDays);
  const startDate = availability.data?.nearestStart ?? null;

  const estimate = useMemo(
    () => calcTailoringEstimate(types, currency, startDate),
    [types, currency, startDate],
  );

  const formatRange = useMemo(
    () => (from: number, to: number) =>
      from === to
        ? formatConvertedPrice(from, currency)
        : `${formatConvertedPrice(from, currency)} – ${formatConvertedPrice(to, currency)}`,
    [currency],
  );

  return { estimate, formatRange, availability, types };
};
