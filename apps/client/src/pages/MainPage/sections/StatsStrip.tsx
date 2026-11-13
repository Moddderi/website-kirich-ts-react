import { useTranslation } from "react-i18next";
import { CountUp } from "../../../components/fx/CountUp";
import { Reveal } from "../../../components/shared/Reveal/Reveal";

const STATS = [
  { to: 30, suffix: "%", key: "stat1Label" },
  { to: 5, suffix: "", key: "stat2Label" },
  { to: 100, suffix: "%", key: "stat3Label" },
  { to: 24, suffix: "/7", key: "stat4Label" },
] as const;

export const StatsStrip = () => {
  const { t } = useTranslation();
  return (
    <section className="border-b border-stone-900/10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal
            key={s.key}
            delay={i * 90}
            className={`px-5 py-10 sm:px-8 sm:py-14 ${
              i % 2 === 1 ? "border-l border-stone-900/10" : ""
            } ${i >= 2 ? "border-t border-stone-900/10 lg:border-t-0" : ""} ${
              i === 2 ? "lg:border-l lg:border-stone-900/10" : ""
            }`}
          >
            <CountUp
              to={s.to}
              suffix={s.suffix}
              className="font-display text-5xl font-medium tracking-tight text-stone-900 sm:text-7xl"
            />
            <p className="mt-3 max-w-[16rem] text-xs leading-relaxed text-stone-500 sm:text-sm">
              {t(`main.${s.key}`)}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
