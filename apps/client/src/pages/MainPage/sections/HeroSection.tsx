import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LuArrowRight,
  LuClock,
  LuCrown,
  LuGem,
  LuMapPin,
  LuRuler,
  LuTruck,
} from "react-icons/lu";
import { HOME_IMAGES } from "../../../constants/homeImages";
import { CATALOG_ENABLED } from "../../../constants/features";
import { optimizeCloudinaryUrl } from "../../../utils/cloudinary";
import { Tilt } from "../../../components/fx/Tilt";
import { LivingBg } from "../../../components/fx/LivingBg";

const Photo = ({
  src,
  alt,
  width,
  className,
  priority = false,
  children,
}: {
  src: string;
  alt: string;
  width: number;
  className: string;
  priority?: boolean;
  children?: React.ReactNode;
}) => (
  <div
    className={`relative overflow-hidden rounded-3xl bg-stone-200 ring-1 ring-stone-900/10 ${className}`}
  >
    <img
      src={optimizeCloudinaryUrl(src, { width })}
      alt={alt}
      width={width}
      height={Math.round(width * 1.33)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className="h-full w-full object-cover"
    />
    {children}
  </div>
);

/** Measuring marks drawn over the main photo (percent positions of the shirt). */
const SCAN_POINTS = [
  { key: "scanNeck", x: 50, y: 15, side: "right" },
  { key: "scanChest", x: 50, y: 37, side: "left" },
  { key: "scanWaist", x: 50, y: 70, side: "right" },
] as const;

const Word = ({
  children,
  index,
  base = 0,
  sweep = false,
}: {
  children: string;
  index: number;
  base?: number;
  sweep?: boolean;
}) => (
  <span
    className="word-in"
    style={{ "--d": `${base + index * 110}ms` } as React.CSSProperties}
  >
    <span className={sweep ? "text-sweep" : undefined}>{children}</span>
    {"\u00A0"}
  </span>
);

export const HeroSection = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement | null>(null);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const words1 = t("main.heroTitle1").split(" ");
  const words2 = t("main.heroTitle2").split(" ");

  const trust = [
    { icon: LuRuler, label: t("main.fitToMm") },
    { icon: LuGem, label: t("main.premiumFabrics") },
    { icon: LuClock, label: t("main.creationFrom14") },
    { icon: LuTruck, label: t("main.shippingIn24h") },
  ];

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      className="fx-cursor-host relative overflow-hidden"
    >
      <LivingBg />
      <div className="fx-cursor-glow" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-32 lg:pt-20">
        <div className="text-center lg:text-left">
          <p className="animate-reveal-up mb-6 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-500 lg:justify-start">
            <span className="hidden h-px w-8 bg-current opacity-60 lg:block" />
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {t("main.vanguardCollection")}
          </p>

          <h1 className="font-display text-[3rem] font-medium leading-[1.0] tracking-tight text-stone-900 sm:text-7xl lg:text-[5.1rem] xl:text-[5.4rem]">
            {words1.map((w, i) => (
              <Word key={`a${i}`} index={i} base={150}>
                {w}
              </Word>
            ))}
            <br className="hidden sm:block" />
            <span className="italic">
              {words2.map((w, i) => (
                <Word
                  key={`b${i}`}
                  sweep
                  index={i}
                  base={150 + words1.length * 110}
                >
                  {w}
                </Word>
              ))}
            </span>
          </h1>

          <p className="animate-reveal-up delay-500 mx-auto mt-8 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg lg:mx-0">
            {t("main.heroDescription")}
          </p>

          <div className="animate-reveal-up delay-700 mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <Link
              to="/individual-tailoring"
              className="btn-ember group inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-semibold">
              {t("main.tailoring")}
              <LuArrowRight
                size={18}
                strokeWidth={1.8}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            {CATALOG_ENABLED ? (
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center rounded-full border border-stone-900/25 px-8 py-4 text-sm font-semibold text-stone-900 transition-colors hover:border-stone-900"
              >
                {t("main.goToCollection")}
              </Link>
            ) : (
              <a
                href="#process"
                className="inline-flex items-center justify-center rounded-full border border-stone-900/25 px-8 py-4 text-sm font-semibold text-stone-900 transition-colors hover:border-stone-900"
              >
                {t("main.processKicker")}
              </a>
            )}
          </div>

          <ul className="animate-reveal-up delay-700 mx-auto mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 text-left lg:mx-0">
            {trust.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 text-xs font-semibold text-stone-700"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-900/20 text-stone-900">
                  <Icon size={16} strokeWidth={1.6} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Photo collage with 3D tilt + measuring scan */}
        <Tilt className="animate-reveal-up delay-300 relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none">
          {/* decorative orbit */}
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="spin-slower pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 text-stone-900/15"
          >
            <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 5" />
            <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeWidth="0.3" />
          </svg>

          <div className="relative grid grid-cols-2 gap-3 sm:gap-5">
            <div className="relative pt-10 sm:pt-14">
              <div className="absolute inset-x-0 bottom-0 top-10 translate-x-2 translate-y-2 rounded-3xl border border-stone-900/25 sm:top-14 sm:translate-x-3 sm:translate-y-3" />
              <Photo
                src={HOME_IMAGES.heroLeft}
                alt="K.I.RICH ballroom shirt"
                width={640}
                priority
                className="relative h-full"
              >
                <div className="palette-original pointer-events-none absolute inset-0">
                  <div className="scan-line" />
                  {SCAN_POINTS.map((p) => (
                    <span
                      key={p.key}
                      className="absolute h-0 w-0"
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    >
                      <span className="ping-dot absolute -left-[5px] -top-[5px] h-[10px] w-[10px] rounded-full bg-accent shadow-[0_0_12px_3px_rgba(255,59,87,0.7)] ring-2 ring-white" />
                      <span
                        className={`absolute top-0 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap ${
                          p.side === "right" ? "left-[10px]" : "right-[10px] flex-row-reverse"
                        }`}
                      >
                        <span className="h-px w-4 bg-white/60 sm:w-8" />
                        <span className="rounded-full border border-white/25 bg-black/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                          {t(`main.${p.key}`)}
                        </span>
                      </span>
                    </span>
                  ))}
                </div>
              </Photo>
            </div>
            <div className="flex flex-col gap-3 sm:gap-5">
              <Photo
                src={HOME_IMAGES.heroTopRight}
                alt="K.I.RICH ballroom shirt, red"
                width={520}
                priority
                className="aspect-[4/5]"
              />
              <Photo
                src={HOME_IMAGES.heroBottomRight}
                alt="K.I.RICH ballroom shirt, brown"
                width={520}
                className="aspect-[4/4.6]"
              />
            </div>
          </div>

          <div className="float-y absolute -left-1 bottom-6 z-10 flex items-center gap-3 rounded-2xl border border-stone-900/15 bg-beige-50/80 px-4 py-3 backdrop-blur-xl sm:-left-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-beige-50">
              <LuCrown size={18} strokeWidth={1.6} />
            </span>
            <div>
              <p className="flex items-center gap-1 text-xs font-bold text-stone-900">
                <LuMapPin size={12} strokeWidth={2} className="text-stone-500" />
                Poltava, Ukraine
              </p>
              <p className="text-[11px] font-medium text-stone-500">
                {t("main.handmade")}
              </p>
            </div>
          </div>

          <div
            className="float-y absolute -right-1 top-3 z-10 flex items-center gap-2 rounded-full border border-stone-900/15 bg-beige-50/80 px-3.5 py-2 text-[11px] font-semibold text-stone-900 backdrop-blur-xl sm:-right-4"
            style={{ animationDelay: "-3s" }}
          >
            <LuRuler size={14} strokeWidth={1.8} />
            {t("main.chipPrecision")}
          </div>
        </Tilt>
      </div>
    </section>
  );
};
