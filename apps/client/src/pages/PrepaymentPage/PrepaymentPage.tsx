import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PREPAYMENT_RATE } from "@project/shared";
import {
  useFormatDate,
  useTailoringEstimate,
} from "../../hooks/useTailoringEstimate";
import { useAppSelector } from "../../store/store";

export const PrepaymentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const programs = useAppSelector((state) => state.tailoring.programs);
  const { estimate, formatRange, types } = useTailoringEstimate();
  const hasMeasurements = useAppSelector(
    (state) => Object.keys(state.tailoring.measurements).length > 0,
  );

  if (types.length === 0) {
    return <Navigate to="/individual-tailoring/step-1" replace />;
  }
  if (!hasMeasurements) {
    return <Navigate to="/individual-tailoring/step-3" replace />;
  }

  const percent = Math.round(PREPAYMENT_RATE * 100);
  const pending = t("prepayment.pending");

  return (
    <main className="grow pb-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 animate-reveal-up">
        <div className="mb-12 text-center">
          <span className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-sm border border-stone-800 mb-6 inline-block">
            {t("prepayment.stepLabel")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-stone-900 mb-6">
            {t("prepayment.title")}
          </h1>
          <p className="text-base font-medium text-stone-500 leading-relaxed">
            {t("prepayment.description")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Items */}
          <section className="rounded-4xl border border-stone-200/60 bg-white p-7 shadow-sm sm:p-9">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              {t("prepayment.itemsTitle")}
            </p>
            <ul className="divide-y divide-stone-100">
              {estimate.items.map((item) => (
                <li
                  key={item.type}
                  className="flex items-baseline justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {t(`selectType.${item.type}`)} · {programs[item.type] ?? "ST"}
                    </p>
                    <p className="text-xs font-medium text-stone-500">
                      {t("selectType.days", {
                        min: item.leadDaysMin,
                        max: item.leadDaysMax,
                      })}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-semibold text-stone-900">
                    {formatRange(item.priceFrom, item.priceTo)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-stone-200 pt-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-900">
                {t("prepayment.priceTitle")}
              </span>
              <span className="text-xl font-semibold text-stone-900">
                {formatRange(estimate.priceFrom, estimate.priceTo)}
              </span>
            </div>
          </section>

          {/* Prepayment */}
          <section className="rounded-4xl bg-stone-900 p-7 text-white shadow-xl sm:p-9">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              {t("prepayment.prepaymentTitle", { percent })}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {formatRange(estimate.prepaymentFrom, estimate.prepaymentTo)}
            </p>
            <p className="mt-3 text-sm font-medium leading-relaxed text-stone-300">
              {t("prepayment.prepaymentDesc")}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  {t("prepayment.startLabel")}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {estimate.startDate ? formatDate(estimate.startDate) : pending}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  {t("prepayment.readyLabel")}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {estimate.readyFrom && estimate.readyTo
                    ? `${formatDate(estimate.readyFrom, false)} – ${formatDate(estimate.readyTo)}`
                    : pending}
                </p>
              </div>
            </div>
          </section>

          {/* Important */}
          <section className="rounded-4xl border border-amber-200/80 bg-amber-50/70 p-7 sm:p-9">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-900">
              {t("prepayment.importantTitle")}
            </p>
            <p className="text-sm font-medium leading-relaxed text-amber-950/80">
              {t("prepayment.importantText")}
            </p>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/individual-tailoring/step-3"
              className="text-center text-xs font-semibold text-stone-500 underline underline-offset-4 hover:text-stone-900"
            >
              {t("prepayment.back")}
            </Link>
            <button
              type="button"
              onClick={() => navigate("/individual-tailoring/checkout")}
              className="rounded-2xl bg-stone-900 px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-stone-900/20 transition-all hover:bg-stone-800 active:scale-[0.98]"
            >
              {t("prepayment.continue")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
