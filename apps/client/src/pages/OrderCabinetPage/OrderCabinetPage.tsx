import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CABINET_STAGES,
  type CabinetStage,
  type MeasurementType,
  type MeasurementUnit,
} from "@project/shared";
import { submitCabinetMeasurements, useCabinetOrder } from "../../api/cabinetApi";
import { MeasurementsForm } from "../../components/MeasurementsForm/MeasurementsForm";
import { saveCabinetToken } from "../../utils/cabinetStorage";
import { useFormatDate } from "../../hooks/useTailoringEstimate";
import { IoCheckmark } from "react-icons/io5";

export const OrderCabinetPage = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const formatDate = useFormatDate();
  const { data: order, isLoading, isError } = useCabinetOrder(token);
  const queryClient = useQueryClient();
  const [unit, setUnit] = useState<MeasurementUnit>("cm");
  const [justSent, setJustSent] = useState(false);

  // Remember the link on this device → the header cabinet icon opens it directly
  useEffect(() => {
    if (order) saveCabinetToken(token);
  }, [order, token]);

  const sendMeasurements = useMutation({
    mutationFn: (values: Record<string, string>) =>
      submitCabinetMeasurements(token as string, { unit, values }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["cabinet", token], updated);
      setJustSent(true);
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm font-medium text-stone-500">
        {t("cabinet.loading")}
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-stone-900">
          {t("cabinet.notFoundTitle")}
        </p>
        <p className="text-sm font-medium leading-relaxed text-stone-500">
          {t("cabinet.notFoundText")}
        </p>
        <Link
          to="/my-orders"
          className="rounded-2xl bg-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-stone-700 active:scale-95"
        >
          {t("cabinet.findOrder")}
        </Link>
      </div>
    );
  }

  const currentIndex = CABINET_STAGES.indexOf(order.stage);

  return (
    <main className="grow pt-12 pb-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8 animate-reveal-up">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-6 inline-block rounded-full border border-stone-800 bg-stone-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-sm">
            {t("cabinet.label", { number: order.number })}
          </span>
          <h1 className="mb-4 text-4xl font-semibold tracking-tighter text-stone-900 sm:text-5xl">
            {t("cabinet.title", { name: order.firstName })}
          </h1>
          <p className="text-base font-medium leading-relaxed text-stone-500">
            {t(`cabinet.stageDesc.${order.stage}`)}
          </p>
        </div>

        {order.measurements.needed && (
          <section className="mx-auto mb-12 max-w-4xl">
            <div className="mb-8 rounded-4xl bg-stone-900 p-7 text-white shadow-xl">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                {t("cabinet.measurementsTitle")}
              </p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-stone-200">
                {t("cabinet.measurementsText")}
              </p>
            </div>
            <MeasurementsForm
              key={unit}
              types={order.garments.map((g) => g.type as MeasurementType)}
              measurementUnit={unit}
              onUnitChange={setUnit}
              initialValues={{}}
              onSubmit={(values) => sendMeasurements.mutate(values)}
              submitLabel={t("cabinet.sendMeasurements")}
              submitting={sendMeasurements.isPending}
              error={sendMeasurements.isError ? t("cabinet.sendError") : null}
            />
          </section>
        )}

        {justSent && !order.measurements.needed && (
          <div className="mx-auto mb-10 max-w-3xl rounded-4xl border border-emerald-200 bg-emerald-50 p-7 text-center shadow-sm">
            <p className="text-sm font-semibold text-emerald-900">
              {t("cabinet.measurementsSent")}
            </p>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10">
          {/* Timeline */}
          <section className="rounded-4xl border border-stone-200/60 bg-white p-7 shadow-sm sm:p-9 lg:col-span-7">
            <p className="mb-6 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              {t("cabinet.progress")}
            </p>
            <ol className="space-y-0">
              {CABINET_STAGES.map((stage: CabinetStage, index) => {
                // A finished order shows every step (including the last) as done
                const finished = order.stage === "done";
                const done = index < currentIndex || finished;
                const active = index === currentIndex && !finished;
                return (
                  <li key={stage} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < CABINET_STAGES.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px ${
                          done ? "bg-stone-900" : "bg-stone-200"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                        done
                          ? "border-stone-900 bg-stone-900 text-white"
                          : active
                            ? "border-stone-900 bg-white text-stone-900 ring-4 ring-stone-900/10"
                            : "border-stone-200 bg-white text-stone-300"
                      }`}
                    >
                      {done ? <IoCheckmark size={16} /> : index + 1}
                    </span>
                    <div className="pt-1">
                      <p
                        className={`text-sm font-semibold ${
                          done || active ? "text-stone-900" : "text-stone-400"
                        }`}
                      >
                        {t(`cabinet.stage.${stage}`)}
                      </p>
                      {active && (
                        <p className="mt-1 text-xs font-medium leading-relaxed text-stone-500">
                          {t(`cabinet.stageDesc.${stage}`)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Details */}
          <aside className="mt-8 space-y-5 lg:col-span-5 lg:mt-0">
            <div className="rounded-4xl bg-stone-900 p-7 text-white shadow-xl">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                {t("cabinet.startLabel")}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight">
                {order.dates.start
                  ? formatDate(order.dates.start)
                  : t("cabinet.pending")}
              </p>
              <div className="my-5 h-px bg-white/10" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                {t("cabinet.readyLabel")}
              </p>
              <p className="mt-2 text-base font-semibold">
                {order.dates.readyTo
                  ? formatDate(order.dates.readyTo)
                  : t("cabinet.pending")}
              </p>
              {order.dates.measurementsDue && !order.measurements.submitted && (
                <>
                  <div className="my-5 h-px bg-white/10" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                    {t("cabinet.measurementsDueLabel")}
                  </p>
                  <p className="mt-2 text-base font-semibold">
                    {formatDate(order.dates.measurementsDue)}
                  </p>
                </>
              )}
            </div>

            <div className="rounded-4xl border border-stone-200/60 bg-white p-7 shadow-sm">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                {t("cabinet.garments")}
              </p>
              <ul className="space-y-3">
                {order.garments.map((garment) => (
                  <li
                    key={garment.type}
                    className="flex items-baseline justify-between gap-4 text-sm"
                  >
                    <span className="font-semibold text-stone-900">
                      {t(`selectType.${garment.type}`)}
                    </span>
                    <span className="text-xs font-semibold text-stone-500">
                      {garment.program}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs font-medium leading-relaxed text-stone-500">
                {t("cabinet.contactNote")}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};
