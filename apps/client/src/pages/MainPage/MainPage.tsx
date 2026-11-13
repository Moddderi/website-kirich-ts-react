import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LuArrowRight,
  LuClock,
  LuCrown,
  LuEye,
  LuGem,
  LuHandshake,
  LuHeart,
  LuHourglass,
  LuMapPin,
  LuRuler,
  LuShirt,
  LuTarget,
  LuTruck,
} from "react-icons/lu";
import logoMini from "../../assets/logo-mini.png";
import { HOME_IMAGES } from "../../constants/homeImages";
import { CATALOG_ENABLED } from "../../constants/features";
import { optimizeCloudinaryUrl } from "../../utils/cloudinary";
import { Reveal } from "../../components/shared/Reveal/Reveal";

const FeaturedProducts = lazy(() => import("./FeaturedProducts"));

const MARQUEE_WORDS = [
  "Ballroom",
  "Bespoke",
  "Standard",
  "Latin",
  "Handmade",
  "Poltava",
];

const Eyebrow = ({
  children,
  light = false,
  center = false,
}: {
  children: ReactNode;
  light?: boolean;
  center?: boolean;
}) => (
  <p
    className={`mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] ${
      center ? "justify-center" : ""
    } ${light ? "text-beige-400" : "text-beige-600"}`}
  >
    <span className="h-px w-8 bg-current opacity-60" />
    {children}
    {center && <span className="h-px w-8 bg-current opacity-60" />}
  </p>
);

const HeroPhoto = ({
  src,
  alt,
  width,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  className: string;
  priority?: boolean;
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
  </div>
);

export const MainPage = () => {
  const { t } = useTranslation();

  const trust = [
    { icon: LuRuler, label: t("main.fitToMm") },
    { icon: LuGem, label: t("main.premiumFabrics") },
    { icon: LuClock, label: t("main.creationFrom14") },
    { icon: LuTruck, label: t("main.shippingIn24h") },
  ];

  const ways = [
    {
      key: "bespoke",
      to: "/individual-tailoring",
      img: HOME_IMAGES.bespoke,
      title: t("main.bespokeTitle"),
      tag: t("main.absolutePrecision"),
      desc: t("main.individualDesc"),
      chips: [
        t("main.fitToMm"),
        t("main.premiumFabrics"),
        t("main.uniqueDesign"),
        t("main.creationFrom14"),
      ],
      delay: 0,
    },
    {
      key: "ready",
      to: CATALOG_ENABLED ? "/catalog" : null,
      img: HOME_IMAGES.ready,
      title: t("main.readyProducts"),
      tag: CATALOG_ENABLED ? t("main.calibratedGrid") : t("main.comingSoon"),
      desc: CATALOG_ENABLED ? t("main.readyDesc") : t("main.comingSoonDesc"),
      chips: CATALOG_ENABLED
        ? [
            t("main.shippingIn24h"),
            t("main.readyPremiumFabrics"),
            t("main.wideAssortment"),
            t("main.wideSizeGrid"),
          ]
        : [],
      delay: 120,
    },
  ];

  return (
    <main className="flex-grow">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_90%_10%,rgba(205,182,140,0.28),transparent_70%),radial-gradient(40%_40%_at_0%_100%,rgba(232,222,201,0.7),transparent_70%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="text-center lg:text-left">
            <div className="animate-reveal-up flex justify-center lg:justify-start">
              <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-beige-600 sm:mb-6">
                <span className="hidden h-px w-8 bg-current opacity-60 lg:block" />
                {t("main.vanguardCollection")}
              </p>
            </div>

            <h1 className="animate-reveal-up delay-200 font-display text-[2.9rem] font-medium leading-[1.02] tracking-tight text-stone-900 sm:text-7xl lg:text-[5.6rem]">
              {t("main.heroTitle1")}
              <br className="hidden sm:block" />{" "}
              <span className="italic text-beige-600">
                {t("main.heroTitle2")}
              </span>
            </h1>

            <p className="animate-reveal-up delay-300 mx-auto mt-7 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg lg:mx-0">
              {t("main.heroDescription")}
            </p>

            <div className="animate-reveal-up delay-500 mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <Link
                to="/individual-tailoring"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-stone-900 px-8 py-4 text-sm font-semibold text-beige-50 transition-all duration-300 hover:bg-stone-950 active:scale-[0.98]"
              >
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
                  className="inline-flex items-center justify-center rounded-full border border-stone-900/20 px-8 py-4 text-sm font-semibold text-stone-900 transition-colors duration-300 hover:border-stone-900"
                >
                  {t("main.goToCollection")}
                </Link>
              ) : (
                <a
                  href="#process"
                  className="inline-flex items-center justify-center rounded-full border border-stone-900/20 px-8 py-4 text-sm font-semibold text-stone-900 transition-colors duration-300 hover:border-stone-900"
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
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-beige-500/50 text-beige-600">
                    <Icon size={16} strokeWidth={1.6} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Photo collage */}
          <div className="animate-reveal-up delay-300 relative mx-auto grid w-full max-w-md grid-cols-2 gap-3 sm:max-w-lg sm:gap-5 lg:max-w-none">
            <div className="relative pt-10 sm:pt-14">
              <div className="absolute inset-x-0 bottom-0 top-10 translate-x-2 translate-y-2 rounded-3xl border border-beige-500/50 sm:top-14 sm:translate-x-3 sm:translate-y-3" />
              <HeroPhoto
                src={HOME_IMAGES.heroLeft}
                alt="K.I.RICH ballroom shirt"
                width={640}
                priority
                className="relative h-full"
              />
            </div>
            <div className="flex flex-col gap-3 sm:gap-5">
              <HeroPhoto
                src={HOME_IMAGES.heroTopRight}
                alt="K.I.RICH ballroom shirt, red"
                width={520}
                priority
                className="aspect-[4/5]"
              />
              <HeroPhoto
                src={HOME_IMAGES.heroBottomRight}
                alt="K.I.RICH ballroom shirt, brown"
                width={520}
                className="aspect-[4/4.6]"
              />
            </div>

            <div className="absolute -left-1 bottom-6 z-10 flex items-center gap-3 rounded-2xl border border-stone-900/10 bg-beige-50/95 px-4 py-3 shadow-[0_18px_40px_-20px_rgba(23,20,18,0.35)] backdrop-blur-md sm:-left-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-beige-300">
                <LuCrown size={18} strokeWidth={1.6} />
              </span>
              <div>
                <p className="flex items-center gap-1 text-xs font-bold text-stone-900">
                  <LuMapPin size={12} strokeWidth={2} className="text-beige-600" />
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

      {/* ================= MARQUEE ================= */}
      <div
        className="marquee overflow-hidden bg-stone-900 py-5 text-beige-200"
        aria-hidden="true"
      >
        <div className="marquee-track flex items-center">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {MARQUEE_WORDS.map((word) => (
                <span
                  key={`${dup}-${word}`}
                  className="flex items-center font-display text-2xl font-medium italic tracking-wide sm:text-3xl"
                >
                  <span className="px-8 sm:px-12">{word}</span>
                  <span className="h-1.5 w-1.5 rotate-45 bg-beige-500/70" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ================= TWO WAYS ================= */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-32">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
          <Eyebrow center>K.I.RICH</Eyebrow>
          <h2 className="font-display text-4xl font-medium tracking-tight text-stone-900 sm:text-6xl">
            {t("main.orderArchitecture")}
          </h2>
          <p className="mt-5 text-sm text-stone-500 sm:text-base">
            {t("main.orderArchitectureDesc")}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-8">
          {ways.map((card) => {
            const frozen = !card.to;
            const body = (
              <>
                <img
                  src={optimizeCloudinaryUrl(card.img, { width: 900 })}
                  alt=""
                  width={900}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out ${
                    frozen
                      ? "opacity-60 grayscale-[55%]"
                      : "opacity-80 group-hover:scale-105"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/5" />

                <div className="relative z-10">
                  <span className="inline-flex items-center gap-2 rounded-full border border-beige-300/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-beige-200">
                    {frozen ? (
                      <LuHourglass size={12} strokeWidth={1.8} />
                    ) : (
                      <span className="h-1.5 w-1.5 rotate-45 bg-beige-400" />
                    )}
                    {card.tag}
                  </span>
                  <h3 className="mt-5 font-display text-4xl font-medium leading-tight sm:text-5xl">
                    {card.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-300">
                    {card.desc}
                  </p>

                  {card.chips.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {card.chips.map((chip) => (
                        <li
                          key={chip}
                          className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-stone-200"
                        >
                          {chip}
                        </li>
                      ))}
                    </ul>
                  )}

                  {frozen ? (
                    <span className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white/80">
                      <LuClock size={16} strokeWidth={1.8} />
                      {t("main.comingSoon")}
                    </span>
                  ) : (
                    <span className="mt-8 inline-flex items-center gap-3 rounded-full bg-beige-50 px-7 py-3.5 text-sm font-bold text-stone-900 transition-colors duration-300 group-hover:bg-beige-200">
                      {t("main.tailoring")}
                      <LuArrowRight
                        size={18}
                        strokeWidth={1.8}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  )}
                </div>
              </>
            );

            const cardClass =
              "relative flex min-h-[30rem] flex-col justify-end overflow-hidden rounded-4xl bg-stone-900 p-6 text-white sm:min-h-[38rem] sm:p-10";

            return (
              <Reveal key={card.key} delay={card.delay}>
                {card.to ? (
                  <Link to={card.to} className={`group ${cardClass}`}>
                    {body}
                  </Link>
                ) : (
                  <div className={cardClass}>{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ================= PROCESS (dark band) ================= */}
      <section
        id="process"
        className="scroll-mt-20 bg-stone-950 py-20 text-beige-50 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal className="mb-12 flex flex-col gap-8 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow light>{t("main.processKicker")}</Eyebrow>
              <h2 className="font-display text-4xl font-medium tracking-tight sm:text-6xl">
                {t("main.processTitle")}
              </h2>
            </div>
            <Link
              to="/individual-tailoring/step-1"
              className="group inline-flex items-center justify-center gap-2 self-start rounded-full bg-beige-50 px-7 py-3.5 text-sm font-semibold text-stone-900 transition-colors duration-300 hover:bg-beige-200 lg:self-auto"
            >
              {t("main.processCta")}
              <LuArrowRight
                size={18}
                strokeWidth={1.8}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>

          <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-4xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <li key={n} className="bg-stone-950">
                <Reveal delay={i * 80} className="h-full p-6 sm:p-7">
                  <span className="font-display text-5xl font-medium leading-none text-beige-500">
                    {String(n).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 text-base font-bold text-white">
                    {t(`individualTailoring.step${n}Title`)}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-stone-400">
                    {t(`individualTailoring.step${n}Desc`)}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= FEATURED READY-MADE (frozen with the catalog) ================= */}
      {CATALOG_ENABLED && (
        <Suspense fallback={null}>
          <FeaturedProducts />
        </Suspense>
      )}

      {/* ================= ABOUT ================= */}
      <section
        id="about"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-32"
      >
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <img
              src={logoMini}
              alt="K.I.RICH"
              width={80}
              height={80}
              loading="lazy"
              className="mb-8 h-16 w-16 rounded-2xl bg-stone-900 object-contain p-1.5"
            />
            <Eyebrow>K.I.RICH SEWING STUDIO</Eyebrow>
            <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-stone-900 sm:text-6xl">
              {t("main.engineeringTitle")}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-stone-500 sm:text-base">
              {t("main.engineeringTagline")}
            </p>
          </Reveal>

          <div className="space-y-10 lg:space-y-14">
            <div className="grid gap-8 sm:grid-cols-2">
              {[
                { icon: LuTarget, title: "philosophyMissionTitle", desc: "philosophyMissionDesc" },
                { icon: LuEye, title: "philosophyVisionTitle", desc: "philosophyVisionDesc" },
              ].map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title} delay={i * 100}>
                  <article>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-beige-500/50 text-beige-600">
                      <Icon size={19} strokeWidth={1.6} />
                    </span>
                    <h3 className="mt-5 font-display text-2xl font-medium text-stone-900">
                      {t(`main.${title}`)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">
                      {t(`main.${desc}`)}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <h3 className="mb-6 font-display text-2xl font-medium text-stone-900">
                {t("main.philosophyValuesTitle")}
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { icon: LuShirt, n: 1 },
                  { icon: LuClock, n: 2 },
                  { icon: LuHeart, n: 3 },
                ].map(({ icon: Icon, n }) => (
                  <div
                    key={n}
                    className="rounded-3xl border border-stone-900/10 bg-white/50 p-6"
                  >
                    <Icon size={20} strokeWidth={1.6} className="text-beige-600" />
                    <h4 className="mt-4 text-sm font-bold text-stone-900">
                      {t(`main.philosophyValue${n}Title`)}
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-stone-600">
                      {t(`main.philosophyValue${n}Desc`)}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <div className="relative overflow-hidden rounded-4xl bg-stone-950 p-7 text-white sm:p-10">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-beige-500/70 to-transparent" />
                <div className="flex items-start gap-4">
                  <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-beige-500/40 text-beige-300">
                    <LuHandshake size={19} strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-medium">
                      {t("main.philosophyManifestoTitle")}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-stone-300 sm:text-base">
                      {t("main.philosophyManifestoDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
};
