import type { ReactNode } from "react";
import { Reveal } from "../../../components/shared/Reveal/Reveal";

export const Kicker = ({
  children,
  center = false,
}: {
  children: ReactNode;
  center?: boolean;
}) => (
  <p
    className={`mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-500 ${
      center ? "justify-center" : ""
    }`}
  >
    <span className="h-px w-8 bg-current opacity-60" />
    {children}
    {center && <span className="h-px w-8 bg-current opacity-60" />}
  </p>
);

export const SectionHead = ({
  kicker,
  title,
  desc,
  center = false,
}: {
  kicker: string;
  title: string;
  desc?: string;
  center?: boolean;
}) => (
  <Reveal
    className={`mb-12 max-w-2xl lg:mb-16 ${center ? "mx-auto text-center" : ""}`}
  >
    <Kicker center={center}>{kicker}</Kicker>
    <h2 className="font-display text-4xl font-medium tracking-tight text-stone-900 sm:text-6xl">
      {title}
    </h2>
    {desc && <p className="mt-5 text-sm text-stone-500 sm:text-base">{desc}</p>}
  </Reveal>
);
