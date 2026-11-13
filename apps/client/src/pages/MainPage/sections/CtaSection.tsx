import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuArrowRight } from "react-icons/lu";
import { Reveal } from "../../../components/shared/Reveal/Reveal";

export const CtaSection = () => {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-6 lg:px-8 lg:pb-36">
      <Reveal>
        <div className="border-beam relative overflow-hidden rounded-4xl border border-stone-900/10 bg-stone-900/[0.02] px-6 py-16 text-center sm:px-12 sm:py-24">
          <div className="fx-grid-wrap [mask-image:radial-gradient(60%_70%_at_50%_50%,#000_10%,transparent_75%)]">
            <div className="fx-grid" />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.14),transparent)]" />

          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-sweep">{t("main.ctaTitle")}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-stone-500 sm:text-base">
              {t("main.ctaDesc")}
            </p>
            <Link
              to="/individual-tailoring/step-1"
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-stone-900 px-9 py-4 text-sm font-semibold text-beige-50 shadow-[0_0_50px_-8px_rgba(255,255,255,0.55)] transition-all duration-300 hover:shadow-[0_0_70px_-6px_rgba(255,255,255,0.8)] active:scale-[0.98]"
            >
              {t("main.processCta")}
              <LuArrowRight
                size={18}
                strokeWidth={1.8}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
