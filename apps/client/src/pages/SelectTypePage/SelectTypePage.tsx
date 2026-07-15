import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setType } from "../../store/tailoringSlice";
import type { MeasurementType } from "@project/shared";

import { IoShirtOutline } from "react-icons/io5";
import { ImScissors } from "react-icons/im";
import { GiClothes, GiSuitcase } from "react-icons/gi";

export const SelectTypePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSelect = (type: MeasurementType) => {
    dispatch(setType(type));
    navigate("/individual-tailoring/step-2");
  };

  const options = [
    {
      type: "body" as const,
      icon: IoShirtOutline,
      title: t("selectType.body"),
      desc: t("selectType.bodyDesc"),
      dark: false,
    },
    {
      type: "jacket" as const,
      icon: ImScissors,
      title: t("selectType.jacket"),
      desc: t("selectType.jacketDesc"),
      dark: false,
    },
    {
      type: "pants" as const,
      icon: GiClothes,
      title: t("selectType.pants"),
      desc: t("selectType.pantsDesc"),
      dark: false,
    },
    {
      type: "suit" as const,
      icon: GiSuitcase,
      title: t("selectType.suit"),
      desc: t("selectType.suitDesc"),
      dark: true,
    },
  ];

  return (
    <section className="grow pb-32 animate-reveal-up">
      <div className="mx-auto max-w-7xl px-6">
        {/* Заголовок */}
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

        {/* Сетка вариантов адаптирована под 4 колонки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto perspective-1000 items-stretch">
          {options.map((opt, index) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                onClick={() => handleSelect(opt.type)}
                className={`group relative flex h-full min-h-[22rem] sm:min-h-[24rem] flex-col overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(28,25,23,0.2)] text-left animate-reveal-up opacity-0 [animation-fill-mode:forwards]
                  ${
                    opt.dark
                      ? "bg-stone-900 border border-stone-800 hover:border-stone-600"
                      : "bg-white border border-stone-200/60 hover:border-stone-400"
                  }`}
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                {/* Фоновый эффект для светлых карточек */}
                {!opt.dark && (
                  <div className="absolute inset-0 bg-linear-to-b from-stone-50 to-stone-100/50 transition-opacity duration-500 group-hover:opacity-50"></div>
                )}

                {/* Фоновый эффект для темной карточки */}
                {opt.dark && (
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[2rem_2rem] mix-blend-overlay opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
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
                      {opt.title}
                    </h3>
                    <p
                      className={`text-sm font-medium text-pretty ${opt.dark ? "text-stone-400" : "text-stone-500"}`}
                    >
                      {opt.desc}
                    </p>
                  </div>
                  <span
                    className={`mt-auto shrink-0 rounded-2xl border py-3 px-8 text-xs font-semibold transition-all duration-300
                    ${
                      opt.dark
                        ? "border-stone-700 bg-stone-800 text-white group-hover:border-white group-hover:bg-white group-hover:text-stone-900"
                        : "border-stone-200 bg-white text-stone-900 group-hover:border-stone-900 group-hover:bg-stone-900 group-hover:text-white"
                    }`}
                  >
                    {t("selectType.select")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
