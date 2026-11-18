import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in ms */
  delay?: number;
  className?: string;
  as?: ElementType;
}

const supportsObserver =
  typeof window !== "undefined" && "IntersectionObserver" in window;

const prefersScrollReveal = (): boolean => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
};

/**
 * Lightweight scroll-reveal: one IntersectionObserver per block, CSS-only
 * transition (opacity + transform → compositor), observer disconnects after
 * the first reveal so there is zero ongoing cost while scrolling.
 */
export const Reveal = ({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: RevealProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(
    !supportsObserver || !prefersScrollReveal(),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !supportsObserver || !prefersScrollReveal()) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      // Two frames so the browser paints the hidden state before animating in.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          reveal();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    observer.observe(el);

    // Safety only: if IO never fires but the block is on screen (edge cases), unhide.
    const fallback = window.setTimeout(() => {
      if (done) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh * 0.92 && rect.bottom > 0) reveal();
    }, 5000);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
};
