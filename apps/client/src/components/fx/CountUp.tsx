import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Counts from 0 to `to` the first time it scrolls into view. */
export const CountUp = ({ to, suffix = "", duration = 1600, className }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const run = () => {
      if (prefersReducedMotion()) {
        raf = requestAnimationFrame(() => setValue(to));
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        setValue(Math.round(eased * to));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      raf = requestAnimationFrame(() => setValue(to));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
};
