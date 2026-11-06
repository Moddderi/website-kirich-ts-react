import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../store/store";
import { StudioCalendar } from "../../components/StudioCalendar/StudioCalendar";
import {
  useFormatDate,
  useTailoringEstimate,
} from "../../hooks/useTailoringEstimate";

export const AvailabilityPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const programs = useAppSelector((state) => state.tailoring.programs);
  const { estimate, availability, types } = useTailoringEstimate();

  if (types.length === 0) {
    return <Navigate to="/individual-tailoring/step-1" replace />;
  }

  const { data, isLoading } = availability;
  const hasCalendar = Boolean(data) && data?.source !== "unavailable";

  return (
    <main className="grow pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 animate-reveal-up">
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <span className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-sm border border-stone-800 mb-6 inline-block">
            {t("availability.stepLabel")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-stone-900 mb-6">
            {t("availability.title")}
          </h1>
          <p className="text-base font-medium text-stone-500 leading-relaxed">
            {t("availability.description")}
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          {/* Calendar */}
          <div className="lg:col-span-8">
            {isLoading && (
              <div
                className="h-[28rem] w-full animate-pulse rounded-4xl bg-stone-200"
                aria-busy="true"
                aria-label={t("availability.loading")}
              />
            )}

            {!isLoading && hasCalendar && data && (
              <StudioCalendar
                ranges={data.ranges}
                nearestStart={data.nearestStart}
              />
            )}

            {!isLoading && !hasCalendar && (
              <div className="rounded-4xl border border-stone-200/60 bg-white p-8 text-center text-sm font-medium text-stone-500 shadow-sm">
                {t("availability.unavailableNote")}
              </div>
            )}
          </div>

          {/* Summary */}
          <aside className="mt-10 lg:mt-0 lg:col-span-4">
            <div className="sticky top-32 space-y-5">
              <div className="rounded-4xl bg-stone-900 p-7 text-white shadow-xl">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  {t("availability.nearestTitle")}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {estimate.startDate
                    ? formatDate(estimate.startDate)
                    : t("availability.nearestUnknown")}
                </p>

                <div className="my-5 h-px bg-white/10" />

                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  {t("availability.readyTitle")}
                </p>
                <p className="mt-2 text-base font-semibold">
                  {estimate.readyFrom && estimate.readyTo
                    ? `${formatDate(estimate.readyFrom, false)} – ${formatDate(estimate.readyTo)}`
                    : t("availability.readyUnknown")}
                </p>
              </div>

              <div className="rounded-4xl border border-stone-200/60 bg-white p-7 shadow-sm">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  {t("availability.yourItems")}
                </p>
                <ul className="space-y-3">
                  {estimate.items.map((item) => (
                    <li
                      key={item.type}
                      className="flex items-baseline justify-between gap-4 text-sm"
                    >
                      <span className="font-semibold text-stone-900">
                        {t(`selectType.${item.type}`)} · {programs[item.type] ?? "ST"}
                      </span>
                      <span className="whitespace-nowrap text-xs font-medium text-stone-500">
                        {t("selectType.days", {
                          min: item.leadDaysMin,
                          max: item.leadDaysMax,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/individual-tailoring/step-1"
                  className="mt-5 inline-block text-xs font-semibold text-stone-500 underline underline-offset-4 hover:text-stone-900"
                >
                  {t("availability.back")}
                </Link>
              </div>

              <button
                type="button"
                onClick={() => navigate("/individual-tailoring/step-3")}
                className="w-full rounded-2xl bg-stone-900 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-stone-900/20 transition-all hover:bg-stone-800 active:scale-[0.98]"
              >
                {t("availability.continue")}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};
