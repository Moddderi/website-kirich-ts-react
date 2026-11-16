import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

interface SpotProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Card with a pointer-following glow (see `.spot` in main.css).
 * Writes two CSS variables straight to the DOM — no React re-renders on mouse move.
 */
export const Spot = ({ children, className = "", style }: SpotProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`spot ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
