import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { RootState } from "../../store/store";
import { setMeasurement, setMeasurementUnit } from "../../store/tailoringSlice";
import { MeasurementsForm } from "../../components/MeasurementsForm/MeasurementsForm";
import type { MeasurementUnit } from "@project/shared";

export const MeasurementsPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { types, measurements, measurementUnit } = useSelector(
    (state: RootState) => state.tailoring,
  );

  const hasTypes = types.length > 0;
  const typesTitle = types.map((type) => t(`measurementConfig.${type}`)).join(" + ");

  if (!hasTypes) {
    return <Navigate to="/individual-tailoring/step-1" replace />;
  }

  const handleUnitChange = (unit: MeasurementUnit) => {
    if (unit === measurementUnit) return;
    dispatch(setMeasurementUnit(unit));
  };

  const onSubmit = (data: Record<string, string>) => {
    Object.entries(data).forEach(([field, value]) => {
      if (field === "waist_definition") return;
      dispatch(setMeasurement({ field, value: String(value) }));
    });

    navigate("/individual-tailoring/step-4");
  };

  return (
    <main className="grow pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 animate-reveal-up">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-sm border border-stone-800 mb-6 inline-block">
            {t("measurements.stepLabel")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-stone-900 mb-6">
            {t("measurements.title", { type: typesTitle })}
          </h1>
          <p className="text-base font-medium text-stone-500 leading-relaxed">
            {t("measurements.description")}
          </p>
          {types.length > 1 && (
            <p className="mt-3 text-xs font-medium text-stone-400">
              {t("measurements.forItems")}
            </p>
          )}
        </div>

        <MeasurementsForm
          key={`${types.join("-")}-${measurementUnit}`}
          types={types}
          measurementUnit={measurementUnit}
          onUnitChange={handleUnitChange}
          initialValues={measurements}
          onSubmit={onSubmit}
          submitLabel={t("measurements.proceedToPrepayment")}
          footer={
            <Link
              to="/individual-tailoring/step-2"
              className="block text-center text-xs font-semibold text-stone-500 underline underline-offset-4 hover:text-stone-900"
            >
              {t("measurements.back")}
            </Link>
          }
        />
      </div>
    </main>
  );
};
