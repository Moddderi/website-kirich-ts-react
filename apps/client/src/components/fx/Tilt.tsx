import { useRef } from "react";
import type { ReactNode } from "react";

interface TiltProps {
  children: ReactNode;
  className?: string;
  max?: number;
}

/** 3D tilt that follows the pointer. Only on devices with a real hover pointer. */
export const Tilt = ({ children, className = "", max = 7 }: TiltProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const raf = useRef(0);

  const canHover = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canHover()) return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (clientX - r.left) / r.width - 0.5;
      const y = (clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(raf.current);
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div className="[perspective:1200px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div
        ref={ref}
        className={`transition-transform duration-300 ease-out [transform-style:preserve-3d] ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
