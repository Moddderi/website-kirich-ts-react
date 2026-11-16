import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuArrowRight } from "react-icons/lu";

/**
 * Mobile-only floating "Start tailoring" button: appears after the hero is
 * scrolled away and hides again when the final CTA block is on screen.
 */
export const StickyCta = () => {
  const { t } = useTranslation();
  const [pastHero, setPastHero] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setPastHero(window.scrollY > window.innerHeight * 0.85);
      const end = document.getElementById("start");
      if (end) {
        const r = end.getBoundingClientRect();
        setAtEnd(r.top < window.innerHeight * 0.9);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!pastHero || atEnd) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4 md:hidden">
      <Link
        to="/individual-tailoring/step-1"
        className="btn-ember cta-pop pointer-events-auto flex w-full items-center justify-center gap-3 rounded-full py-4 text-sm font-bold"
      >
        {t("main.processCta")}
        <LuArrowRight size={18} strokeWidth={2} />
      </Link>
    </div>
  );
};
