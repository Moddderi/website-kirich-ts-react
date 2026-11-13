import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuArrowRight, LuCalendarDays, LuRuler, LuShirt } from "react-icons/lu";
import { Reveal } from "../../../components/shared/Reveal/Reveal";
import { LivingBg } from "../../../components/fx/LivingBg";

const CHIPS = [
  { icon: LuShirt, key: "ctaChip1" },
  { icon: LuCalendarDays, key: "ctaChip2" },
  { icon: LuRuler, key: "ctaChip3" },
] as const;

export const CtaSection = () => {
  const { t } = useTranslation();

  return (
    <section
      id="start"
      className="mx-auto max-w-7xl px-5 pb-24 sm:px-6 lg:px-8 lg:pb-36"
    >
      <Reveal>
        <div className="relative overflow-hidden rounded-4xl border border-stone-900/10 bg-stone-900/[0.02] px-6 py-16 text-center sm:px-12 sm:py-24">
          <LivingBg />

          <div className="relative">
            <ol className="mb-8 flex flex-wrap items-center justify-center gap-2">
              {CHIPS.map(({ icon: Icon, key }, i) => (
                <li
                  key={key}
                  className="flex items-center gap-2 rounded-full border border-stone-900/15 bg-stone-900/[0.04] px-3.5 py-1.5 text-[11px] font-semibold text-stone-700 backdrop-blur-sm"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <Icon size={13} strokeWidth={1.8} />
                  {t(`main.${key}`)}
                </li>
              ))}
            </ol>

            <h2 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
              {t("main.ctaTitle")}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
              {t("main.ctaDesc")}
            </p>
            <Link
              to="/individual-tailoring/step-1"
              className="btn-ember group mt-10 inline-flex items-center gap-3 rounded-full px-10 py-4 text-sm font-bold"
            >
              {t("main.processCta")}
              <LuArrowRight
                size={18}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <p className="mt-5 text-xs text-stone-500">{t("main.ctaNote")}</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
