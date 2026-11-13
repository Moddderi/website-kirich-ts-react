import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { setGarmentProgram, toggleType } from "../../store/tailoringSlice";
import { CurrencySwitcher } from "../../components/CurrencySwitcher/CurrencySwitcher";
import {
  TAILORING_GARMENTS,
  convertFromUah,
  type MeasurementType,
  type TailoringProgram,
} from "@project/shared";
import {
  useScheduleFormat,
  useTailoringEstimate,
} from "../../hooks/useTailoringEstimate";
import { IoShirtOutline, IoCheckmark } from "react-icons/io5";
import { ImScissors } from "react-icons/im";
import { GiClothes, GiSuitcase } from "react-icons/gi";

const OPTIONS = [
  { type: "body" as const, icon: IoShirtOutline, dark: false },
  { type: "jacket" as const, icon: ImScissors, dark: false },
  { type: "pants" as const, icon: GiClothes, dark: false },
  { type: "suit" as const, icon: GiSuitcase, dark: true },
];

export const SelectTypePage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const selected = useAppSelector((state) => state.tailoring.types);
  const programs = useAppSelector((state) => state.tailoring.programs);
  const currency = useAppSelector((state) => state.currency.code);
  const { estimate, formatRange, workDaysTable } = useTailoringEstimate();
  const schedule = useScheduleFormat();

  const cardPrice = (type: MeasurementType) => {
    const info = TAILORING_GARMENTS[type];
    return formatRange(
      convertFromUah(info.priceFromUah, currency),
      convertFromUah(info.priceToUah, currency),
    );
  };

  const hasSelection = selected.length > 0;

  return (
    <section className="grow pb-40 animate-reveal-up">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center max-w-2xl mx-auto animate-reveal-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          <span className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-sm border border-stone-800 mb-6 inline-block">
            {t("selectType.stepLabel")}
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-stone-900 mb-6">
            {t("selectType.title")}
          </h1>
          <p className="text-base font-medium text-stone-500 leading-relaxed">
            {t("selectType.description")}
          </p>
        </div>

        <div className="mx-auto mb-6 flex max-w-6xl justify-end">
          <CurrencySwitcher />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto perspective-1000 items-stretch">
          {OPTIONS.map((opt, index) => {
            const Icon = opt.icon;
            const info = TAILORING_GARMENTS[opt.type];
            const isSelected = selected.includes(opt.type);

            return (
              <div key={opt.type} className="flex flex-col gap-3">
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => dispatch(toggleType(opt.type))}
                className={`group relative flex h-full min-h-[24rem] flex-col overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(28,25,23,0.2)] text-left animate-reveal-up opacity-0 [animation-fill-mode:forwards]
                  ${
                    opt.dark
                      ? "bg-stone-900 border border-stone-800 hover:border-stone-600"
                      : "bg-white border border-stone-200/60 hover:border-stone-400"
                  }
                  ${isSelected ? "ring-2 ring-offset-2 ring-stone-900" : ""}`}
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                {!opt.dark && (
                  <div className="absolute inset-0 bg-linear-to-b from-stone-50 to-stone-100/50 transition-opacity duration-500 group-hover:opacity-50"></div>
                )}
                {opt.dark && (
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[2rem_2rem] mix-blend-overlay opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                )}

                {isSelected && (
                  <span
                    className={`absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-md ${
                      opt.dark
                        ? "bg-white text-stone-900"
                        : "bg-stone-900 text-white"
                    }`}
                  >
                    <IoCheckmark size={18} />
                  </span>
                )}

                <div className="relative z-10 flex h-full flex-col items-center gap-5 p-6 sm:p-8 text-center">
                  <div
                    className={`flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full shadow-sm border transition-transform duration-500 group-hover:scale-110 
                    ${opt.dark ? "bg-stone-800 border-stone-700" : "bg-stone-50 border-stone-200"}`}
                  >
                    <Icon
                      size={28}
                      color={opt.dark ? "white" : "currentColor"}
                    />
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col justify-center">
                    <h3
                      className={`text-xl sm:text-2xl font-semibold tracking-tighter mb-2 text-balance leading-tight ${opt.dark ? "text-white" : "text-stone-900"}`}
                    >
                      {t(`selectType.${opt.type}`)}
                    </h3>
                    <p
                      className={`text-sm font-medium text-pretty ${opt.dark ? "text-stone-400" : "text-stone-500"}`}
                    >
                      {t(`selectType.${opt.type}Desc`)}
                    </p>
                  </div>

                  <div
                    className={`w-full rounded-2xl border px-4 py-3 text-center ${
                      opt.dark
                        ? "border-stone-700 bg-stone-800/60"
                        : "border-stone-200 bg-white/70"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${opt.dark ? "text-white" : "text-stone-900"}`}
                    >
                      {t("selectType.priceRange", {
                        range: cardPrice(opt.type),
                      })}
                    </p>
                    <p
                      className={`mt-1 text-[11px] font-medium ${opt.dark ? "text-stone-400" : "text-stone-500"}`}
                    >
                      {t("selectType.leadTime", {
                        days: (() => {
                          // Real production time (working days) from the price list
                          const real =
                            workDaysTable?.[programs[opt.type] ?? "ST"]?.[opt.type];
                          return typeof real === "number"
                            ? schedule.days(real, real)
                            : schedule.days(info.leadDaysMin, info.leadDaysMax);
                        })(),
                      })}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-2xl border py-3 px-8 text-xs font-semibold transition-all duration-300
                    ${
                      isSelected
                        ? opt.dark
                          ? "border-white bg-white text-stone-900"
                          : "border-stone-900 bg-stone-900 text-white"
                        : opt.dark
                          ? "border-stone-700 bg-stone-800 text-white group-hover:border-white group-hover:bg-white group-hover:text-stone-900"
                          : "border-stone-200 bg-white text-stone-900 group-hover:border-stone-900 group-hover:bg-stone-900 group-hover:text-white"
                    }`}
                  >
                    {isSelected ? t("selectType.selected") : t("selectType.select")}
                  </span>
                </div>
              </button>

              <div
                role="radiogroup"
                aria-label={`${t(`selectType.${opt.type}`)} — ${t("selectType.programTitle")}`}
                className="grid grid-cols-2 gap-1 rounded-full border border-stone-200 bg-white p-1 shadow-sm"
              >
                {(["ST", "LAT"] as TailoringProgram[]).map((value) => {
                  const active = isSelected && programs[opt.type] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() =>
                        dispatch(setGarmentProgram({ type: opt.type, program: value }))
                      }
                      className={`rounded-full px-2 py-2.5 text-[11px] font-semibold transition-all duration-300 ${
                        active
                          ? "bg-stone-900 text-white shadow-md"
                          : "text-stone-500 hover:bg-stone-100"
                      }`}
                    >
                      {t(`selectType.program${value}`)}
                    </button>
                  );
                })}
              </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs font-medium text-stone-400 leading-relaxed">
          {t("selectType.programHint")}. {t("selectType.approxNote")} {t("selectType.suitNote")}
        </p>
      </div>

      {/* Sticky summary */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              {t("selectType.summaryTitle")}
            </p>
            {hasSelection ? (
              <p className="truncate text-sm font-semibold text-stone-900">
                {selected
                  .map((type) => `${t(`selectType.${type}`)} ${programs[type] ?? "ST"}`)
                  .join(" + ")}
                <span className="ml-2 font-medium text-stone-500">
                  · {t("selectType.total")}{" "}
                  {formatRange(estimate.priceFrom, estimate.priceTo)}
                </span>
              </p>
            ) : (
              <p className="text-sm font-medium text-stone-500">
                {t("selectType.summaryEmpty")}
              </p>
            )}

          </div>

          <button
            type="button"
            disabled={!hasSelection}
            onClick={() => navigate("/individual-tailoring/step-2")}
            className="rounded-2xl bg-stone-900 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-stone-900/20 transition-all hover:bg-stone-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("selectType.continue")}
          </button>
        </div>
      </div>
    </section>
  );
};
