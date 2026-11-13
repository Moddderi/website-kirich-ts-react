import { useTranslation } from "react-i18next";
import {
  LuCalendarDays,
  LuGem,
  LuGlobe,
  LuRuler,
  LuShirt,
  LuUserRound,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { Reveal } from "../../../components/shared/Reveal/Reveal";
import { Spot } from "../../../components/fx/Spot";
import { SectionHead } from "./SectionHead";

const CARDS: { n: number; icon: IconType; className: string }[] = [
  { n: 1, icon: LuRuler, className: "md:col-span-2 md:row-span-2" },
  { n: 2, icon: LuGem, className: "" },
  { n: 3, icon: LuCalendarDays, className: "" },
  { n: 4, icon: LuUserRound, className: "" },
  { n: 5, icon: LuGlobe, className: "" },
  { n: 6, icon: LuShirt, className: "" },
];

export const WhySection = () => {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-8 lg:pb-32">
      <SectionHead kicker={t("main.whyKicker")} title={t("main.whyTitle")} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[minmax(13rem,auto)]">
        {CARDS.map(({ n, icon: Icon, className }, i) => (
          <Reveal key={n} delay={i * 70} className={className}>
            <Spot className="group h-full rounded-4xl">
              <div className="relative h-full overflow-hidden rounded-4xl border border-stone-900/10 bg-stone-900/[0.025] p-6 sm:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-900/20 text-stone-900 transition-all duration-500 group-hover:border-transparent group-hover:bg-accent group-hover:text-white group-hover:shadow-[0_0_28px_-2px_rgba(255,59,87,0.8)]">
                  <Icon size={21} strokeWidth={1.5} />
                </span>
                <h3
                  className={`mt-6 font-display font-medium tracking-tight text-stone-900 ${
                    n === 1 ? "text-4xl sm:text-5xl" : "text-2xl"
                  }`}
                >
                  {t(`main.why${n}Title`)}
                </h3>
                <p
                  className={`mt-3 leading-relaxed text-stone-500 ${
                    n === 1 ? "max-w-md text-sm sm:text-base" : "text-sm"
                  }`}
                >
                  {t(`main.why${n}Desc`)}
                </p>

                {n === 1 && (
                  <span
                    aria-hidden
                    className="text-outline pointer-events-none absolute bottom-10 right-6 font-display text-[9rem] font-medium italic leading-none sm:text-[13rem]"
                  >
                    mm
                  </span>
                )}
                {n === 1 && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-70 [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,0.5)_0_1px,transparent_1px_12px),repeating-linear-gradient(90deg,rgba(255,255,255,0.85)_0_1px,transparent_1px_60px)] [background-position:0_100%] [background-repeat:repeat-x] [background-size:100%_14px,100%_28px] [mask-image:linear-gradient(to_right,transparent,#000_15%,#000_85%,transparent)]"
                  />
                )}
              </div>
            </Spot>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
