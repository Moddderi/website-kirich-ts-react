import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuArrowRight } from "react-icons/lu";
import { Reveal } from "../../../components/shared/Reveal/Reveal";
import { Kicker } from "./SectionHead";

const STEPS = [1, 2, 3, 4, 5];

/** Vertical timeline whose line "fills" while you scroll and lights the passed steps. */
export const ProcessSection = () => {
  const { t } = useTranslation();
  const listRef = useRef<HTMLOListElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let raf = 0;
    let last = -1;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rect = list.getBoundingClientRect();
      const trigger = vh * 0.62;
      const p = Math.min(Math.max((trigger - rect.top) / rect.height, 0), 1);
      list.style.setProperty("--p", String(p));

      let count = 0;
      list.querySelectorAll("li").forEach((li) => {
        if (li.getBoundingClientRect().top < trigger) count++;
      });
      if (count !== last) {
        last = count;
        setActive(count);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="process"
      className="scroll-mt-20 border-y border-stone-900/10 bg-stone-50 py-20 lg:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <Kicker>{t("main.processKicker")}</Kicker>
          <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-stone-900 sm:text-6xl">
            {t("main.processTitle")}
          </h2>
          <Link
            to="/individual-tailoring/step-1"
            className="btn-ember group mt-10 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            {t("main.processCta")}
            <LuArrowRight
              size={18}
              strokeWidth={1.8}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </Reveal>

        <ol
          ref={listRef}
          className="relative space-y-5 pl-12 [--p:0] sm:pl-16"
        >
          {/* track + fill: both 2px wide, centred on x = 14px (the dots' centre line) */}
          <span className="absolute bottom-6 left-[13px] top-6 w-[2px] rounded-full bg-stone-900/10" />
          <span
            className="absolute bottom-6 left-[13px] top-6 w-[2px] origin-top rounded-full bg-gradient-to-b from-accent via-accent to-accent-2 shadow-[0_0_14px_rgba(196,65,77,0.8)] will-change-transform"
            style={{ transform: "scaleY(var(--p))" }}
          />

          {STEPS.map((n, i) => {
            const on = i < active;
            return (
              <li key={n} className="relative">
                {/* dot: 28px box, left edge at -48px/-64px → centre exactly at x = 14px */}
                <span
                  className={`absolute -left-12 top-7 grid h-7 w-7 place-items-center rounded-full border-2 transition-all duration-500 sm:-left-16 ${
                    on
                      ? "border-accent bg-accent shadow-[0_0_26px_rgba(196,65,77,0.75)]"
                      : "border-stone-900/20 bg-beige-50"
                  }`}
                >
                  <span
                    className={`block h-2 w-2 rounded-full transition-colors duration-500 ${
                      on ? "bg-white" : "bg-stone-900/30"
                    }`}
                  />
                </span>

                <div
                  className={`rounded-3xl border p-6 transition-all duration-500 sm:p-8 ${
                    on
                      ? "border-accent/40 bg-stone-900/[0.04]"
                      : "border-stone-900/10 bg-transparent opacity-55"
                  }`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 sm:text-xl">
                        {t(`individualTailoring.step${n}Title`)}
                      </h3>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-500">
                        {t(`individualTailoring.step${n}Desc`)}
                      </p>
                    </div>
                    <span
                      className={`font-display text-6xl font-medium leading-none transition-colors duration-500 sm:text-7xl ${
                        on ? "text-ember" : "text-outline"
                      }`}
                    >
                      {String(n).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
