import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { ProductImage } from "../shared/ProductImage/ProductImage";
import { optimizeCloudinaryUrl } from "../../utils/cloudinary";
import {
  FINAL_MEASUREMENT_FIELD,
  MEASUREMENTS_CATALOG,
  getMeasurementFieldsForTypes,
  getMeasurementSchemaForTypes,
  type MeasurementType,
  type MeasurementUnit,
} from "@project/shared";

const UNIT_OPTIONS: MeasurementUnit[] = ["cm", "in"];

interface MeasurementsFormProps {
  types: MeasurementType[];
  measurementUnit: MeasurementUnit;
  onUnitChange: (unit: MeasurementUnit) => void;
  initialValues: Record<string, string>;
  onSubmit: (values: Record<string, string>) => void;
  submitLabel: string;
  submitting?: boolean;
  error?: string | null;
  /** e.g. a "back" link under the submit button */
  footer?: ReactNode;
}

/**
 * The measurements blank: unit switch + one field per measurement + height.
 * Used on the order flow (step 3) and in the client cabinet.
 */
export const MeasurementsForm = ({
  types,
  measurementUnit,
  onUnitChange,
  initialValues,
  onSubmit,
  submitLabel,
  submitting = false,
  error = null,
  footer,
}: MeasurementsFormProps) => {
  const { t } = useTranslation();
  const fields = getMeasurementFieldsForTypes(types);
  const unitLabel = t(`measurementUnits.${measurementUnit}`);
  const heightLimits =
    measurementUnit === "cm"
      ? { min: 100, max: 250, placeholder: "170" }
      : { min: 39, max: 98, placeholder: "67" };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getMeasurementSchemaForTypes(types, measurementUnit)),
    defaultValues: {
      [FINAL_MEASUREMENT_FIELD]: initialValues[FINAL_MEASUREMENT_FIELD] ?? "",
      ...initialValues,
    },
  });

  return (
        <form
          key={`${types.join("-")}-${measurementUnit}`}
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-6xl mx-auto space-y-12"
        >
          <div
            className="product-card-enter flex flex-col items-center gap-3"
            style={{ animationDelay: "0ms" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              {t("measurements.unitLabel")}
            </p>
            <div className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 p-1">
              {UNIT_OPTIONS.map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => onUnitChange(unit)}
                  className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-all ${
                    measurementUnit === unit
                      ? "bg-stone-900 text-white shadow-sm"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {t(`measurementUnits.${unit}`)}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-400">
              {t("measurements.unitChangeNote")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fields.map((field, index) => {
              const measurementInfo =
                MEASUREMENTS_CATALOG[
                  field as keyof typeof MEASUREMENTS_CATALOG
                ];
              const fieldError = errors[field]?.message as string;
              const isInfoBlock = field === "waist_definition";

              return (
                <div
                  key={field}
                  className={`product-card-enter ${
                    isInfoBlock
                      ? "bg-stone-800 border-stone-800 text-white"
                      : "bg-white border-stone-200/60 text-stone-900"
                  } rounded-4xl p-5 border shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300 h-full`}
                  style={{ animationDelay: `${(index + 1) * 60}ms` }}
                >
                  <div className="aspect-4/5 w-full rounded-2xl bg-stone-200 border border-stone-100 mb-4 overflow-hidden relative flex items-center justify-center group shrink-0">
                    <ProductImage
                      src={optimizeCloudinaryUrl(measurementInfo.imageUrl)}
                      alt={t(`measurementNames.${field}`)}
                      loading={index < 4 ? "eager" : "lazy"}
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3
                    className={`${isInfoBlock ? "text-white" : "text-stone-900"} text-sm font-semibold mb-1 leading-tight`}
                  >
                    {t(`measurementNames.${field}`)}
                  </h3>
                  <p
                    className={`${isInfoBlock ? "text-stone-300" : "text-stone-500"} text-[11px] font-medium mb-4 overflow-y-auto max-h-24 pr-1 leading-relaxed scrollbar-thin`}
                    title={t(`measurementDescriptions.${field}`)}
                  >
                    {t(`measurementDescriptions.${field}`)}
                  </p>

                  {!isInfoBlock && (
                    <div className="relative mt-auto">
                      <input
                        {...register(field)}
                        type="number"
                        step="0.1"
                        placeholder="0"
                        className={`block w-full rounded-xl border-0 bg-stone-50 py-3 pl-4 pr-12 text-sm font-semibold text-stone-900 shadow-inner ring-1 ring-inset ${
                          fieldError ? "ring-red-500" : "ring-stone-200"
                        } focus:ring-2 focus:ring-stone-900 transition-all`}
                      />
                      <span className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-stone-400 pointer-events-none">
                        {unitLabel}
                      </span>
                    </div>
                  )}

                  {isInfoBlock && (
                    <div className="mt-auto bg-stone-700/50 border border-stone-600/50 rounded-xl py-3 px-4 text-center text-[11px] font-semibold text-stone-100 shadow-inner">
                      {t("measurements.preparationStage")}
                    </div>
                  )}

                  {fieldError && (
                    <p className="mt-1.5 text-[10px] font-medium text-red-500">
                      {fieldError}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="product-card-enter max-w-xl mx-auto bg-white rounded-4xl p-8 md:p-10 border border-stone-200/60 shadow-sm"
            style={{ animationDelay: `${(fields.length + 1) * 60}ms` }}
          >
            <h2 className="text-xl font-semibold tracking-tighter text-stone-900 mb-6 text-center">
              {t("measurements.finalData")}
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-2 uppercase tracking-widest text-center">
                  {t(`measurementNames.${FINAL_MEASUREMENT_FIELD}`)} ({unitLabel})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={heightLimits.min}
                  max={heightLimits.max}
                  placeholder={t("measurements.example", { value: heightLimits.placeholder })}
                  {...register(FINAL_MEASUREMENT_FIELD)}
                  className={`block w-full rounded-2xl border-0 bg-stone-50 py-4 pl-5 pr-5 text-center text-base font-semibold text-stone-900 shadow-inner ring-1 ring-inset ${
                    errors[FINAL_MEASUREMENT_FIELD]
                      ? "ring-red-500"
                      : "ring-stone-200"
                  } focus:ring-2 focus:ring-stone-900 transition-all placeholder:text-stone-400`}
                />
                {errors[FINAL_MEASUREMENT_FIELD] && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 text-center">
                    {String(errors[FINAL_MEASUREMENT_FIELD]?.message)}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 disabled:opacity-60 flex items-center justify-center gap-2 rounded-2xl bg-stone-900 py-4 px-8 text-sm font-semibold text-white hover:bg-stone-800 transition-all active:scale-[0.98] shadow-lg shadow-stone-900/20 group"
              >
                {submitLabel}
              </button>
              {error && (
                <p className="text-center text-xs font-medium text-red-500">
                  {error}
                </p>
              )}
              {footer}
            </div>
          </div>
        </form>
  );
};
