import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LuArrowRight,
  LuClock,
  LuCrown,
  LuGem,
  LuGift,
  LuMapPin,
  LuRuler,
  LuTruck,
} from "react-icons/lu";
import { useHomeImages } from "../../../constants/homeImages";
import { CATALOG_ENABLED } from "../../../constants/features";
import { optimizeCloudinaryUrl } from "../../../utils/cloudinary";
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

const scrollToHomeGifts = () => {
  document.getElementById("home-gifts")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

export const HeroSection = () => {
  const { t } = useTranslation();
  const homeImages = useHomeImages();
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
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
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

          <div className="animate-reveal-up delay-700 mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:items-start lg:justify-start">
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
          <div className="animate-reveal-up delay-700 mt-3 flex justify-center lg:justify-start">
            <button
              type="button"
              onClick={scrollToHomeGifts}
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-accent/40 bg-linear-to-r from-accent/8 to-transparent px-8 py-4 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-accent/70 hover:from-accent/15 sm:w-auto"
            >
              <LuGift
                size={18}
                strokeWidth={1.8}
                className="text-accent transition-transform group-hover:scale-110"
                aria-hidden
              />
              {t("main.giftsScrollCta")}
            </button>
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

        {/* Photo collage: one tall hero shot + two stacked, flush grid */}
        <div className="animate-reveal-up delay-300 relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none">
          <div className="grid aspect-[5/6] grid-cols-[1.15fr_1fr] grid-rows-2 gap-3 sm:gap-4">
            <Photo
              src={homeImages.heroLeft}
              alt="K.I.RICH ballroom shirt"
              width={720}
              priority
              className="row-span-2 h-full"
            />
            <Photo
              src={homeImages.heroTopRight}
              alt="K.I.RICH ballroom shirt, red"
              width={520}
              priority
              className="h-full"
            />
            <Photo
              src={homeImages.heroBottomRight}
              alt="K.I.RICH ballroom shirt, brown"
              width={520}
              className="h-full"
            />
          </div>

          <div className="absolute -bottom-5 left-4 z-10 flex items-center gap-3 rounded-2xl border border-stone-900/15 bg-beige-50/85 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur-xl sm:left-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-[#fff]">
              <LuCrown size={18} strokeWidth={1.6} />
            </span>
            <div>
              <p className="flex items-center gap-1 text-xs font-bold text-stone-900">
                <LuMapPin size={12} strokeWidth={2} className="text-accent" />
                Poltava, Ukraine
              </p>
              <p className="text-[11px] font-medium text-stone-500">
                {t("main.handmade")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
