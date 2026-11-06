import { FaPenRuler } from "react-icons/fa6";
import { IoTimeOutline, IoManOutline } from "react-icons/io5";
import { MdOutlineWorkspacePremium } from "react-icons/md";
import { FiBox } from "react-icons/fi";
import {
  HiOutlineEye,
  HiOutlineHeart,
  HiOutlineFlag,
  HiArrowLongRight,
} from "react-icons/hi2";
import { RiVipCrown2Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import logoMini from "../../assets/logo-mini.png";
import { HOME_IMAGES } from "../../constants/homeImages";
import { optimizeCloudinaryUrl } from "../../utils/cloudinary";
import { getProducts } from "../../api/productApi";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { Reveal } from "../../components/shared/Reveal/Reveal";
import type { Product } from "@project/shared";

const MARQUEE_WORDS = [
  "Ballroom",
  "Bespoke",
  "Standard",
  "Latin",
  "Handmade",
  "Poltava",
];

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
    className={`relative overflow-hidden rounded-[2rem] bg-stone-800 shadow-[0_30px_60px_-20px_rgba(28,25,23,0.45)] ring-1 ring-stone-900/10 ${className}`}
  >
    <img
      src={optimizeCloudinaryUrl(src, { width })}
      alt={alt}
      width={width}
      height={Math.round(width * 1.33)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-105"
    />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/30 via-transparent to-transparent" />
  </div>
);

const FeaturedProducts = () => {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ["products", { page: 1, limit: 4, home: true }],
    queryFn: () => getProducts({ page: 1, limit: 4, search: "" }),
    staleTime: 1000 * 60 * 10,
  });

  const items = data?.items?.slice(0, 4) ?? [];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <Reveal className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-500">
            {t("main.featuredKicker")}
          </p>
          <h2 className="font-display text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            {t("main.featuredTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-sm font-medium text-stone-500">
            {t("main.featuredSubtitle")}
          </p>
        </div>
        <Link
          to="/catalog"
          className="group inline-flex items-center gap-2 self-start text-sm font-semibold text-stone-900 sm:self-auto"
        >
          <span className="border-b border-stone-900/30 pb-0.5 transition-colors group-hover:border-stone-900">
            {t("main.viewAll")}
          </span>
          <HiArrowLongRight
            size={20}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </Reveal>

      <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {items.length > 0
          ? items.map((item: Product, index: number) => (
              <ProductCard
                key={item.product_code || item.id}
                product={item}
                imageLoading="lazy"
                enterDelayMs={index * 80}
              />
            ))
          : [...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="relative mb-4 aspect-3/4 overflow-hidden rounded-4xl bg-stone-200">
                  <div className="image-shimmer absolute inset-0" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-stone-200" />
                  <div className="h-4 w-1/2 rounded bg-stone-200" />
                </div>
              </div>
            ))}
      </div>
    </section>
  );
};

export const MainPage = () => {
  const { t } = useTranslation();

  const trust = [
    { icon: FaPenRuler, label: t("main.fitToMm") },
    { icon: MdOutlineWorkspacePremium, label: t("main.premiumFabrics") },
    { icon: IoTimeOutline, label: t("main.creationFrom14") },
    { icon: FiBox, label: t("main.shippingIn24h") },
  ];

  return (
    <main className="flex-grow">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* Static, cheap background: gradients only (no blur filters / no animation) */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_85%_15%,rgba(224,213,193,0.7),transparent_70%),radial-gradient(40%_40%_at_5%_90%,rgba(234,224,207,0.8),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="text-center lg:text-left">
            <div className="animate-reveal-up mb-8 inline-flex items-center gap-3 rounded-full border border-stone-300/70 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-stone-500 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-stone-800" />
              </span>
              {t("main.vanguardCollection")}
            </div>

            <h1 className="animate-reveal-up delay-200 text-[2.75rem] font-semibold leading-[1.02] tracking-tight text-stone-900 sm:text-7xl lg:text-[5.5rem]">
              <span className="font-display">{t("main.heroTitle1")}</span>
              <br className="hidden sm:block" />{" "}
              <span className="font-display italic text-stone-500">
                {t("main.heroTitle2")}
              </span>
            </h1>

            <p className="animate-reveal-up delay-300 mx-auto mt-7 max-w-xl text-base font-medium leading-relaxed text-stone-600 sm:text-lg lg:mx-0">
              {t("main.heroDescription")}
            </p>

            <div className="animate-reveal-up delay-500 mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <Link
                to="/individual-tailoring"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-stone-900 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-stone-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-stone-800 active:translate-y-0"
              >
                {t("main.tailoring")}
                <HiArrowLongRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white/60 px-8 py-4 text-sm font-semibold text-stone-900 transition-all duration-300 hover:border-stone-900 hover:bg-white"
              >
                {t("main.goToCollection")}
              </Link>
            </div>

            <ul className="animate-reveal-up delay-700 mx-auto mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 text-left lg:mx-0">
              {trust.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 text-xs font-semibold text-stone-700"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300/80 bg-white/70 text-stone-800">
                    <Icon size={15} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Photo collage */}
          <div className="animate-reveal-up delay-300 relative mx-auto grid w-full max-w-md grid-cols-2 gap-4 sm:max-w-lg sm:gap-5 lg:max-w-none">
            <div className="float-soft pt-10 [--r:-1.5deg] sm:pt-14">
              <HeroPhoto
                src={HOME_IMAGES.heroLeft}
                alt="K.I.RICH ballroom shirt"
                width={640}
                priority
                className="aspect-[3/4.2]"
              />
            </div>
            <div
              className="float-soft flex flex-col gap-4 [--r:1.5deg] sm:gap-5"
              style={{ animationDelay: "-4s" }}
            >
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

            <div className="absolute -left-2 bottom-6 z-10 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-xl backdrop-blur-md sm:-left-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white">
                <RiVipCrown2Line size={18} />
              </span>
              <div>
                <p className="text-xs font-bold text-stone-900">Poltava, Ukraine</p>
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
        className="marquee overflow-hidden border-y border-stone-200 bg-stone-900 py-5 text-beige-200"
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
                  <span className="text-beige-500/60">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ================= TWO WAYS ================= */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
            {t("main.orderArchitecture")}
          </h2>
          <p className="mt-5 text-sm font-medium text-stone-500 sm:text-base">
            {t("main.orderArchitectureDesc")}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {[
            {
              to: "/individual-tailoring",
              img: HOME_IMAGES.bespoke,
              title: t("main.bespokeTitle"),
              tag: t("main.absolutePrecision"),
              desc: t("main.individualDesc"),
              cta: t("main.tailoring"),
              chips: [
                t("main.fitToMm"),
                t("main.premiumFabrics"),
                t("main.uniqueDesign"),
                t("main.creationFrom14"),
              ],
              delay: 0,
            },
            {
              to: "/catalog",
              img: HOME_IMAGES.ready,
              title: t("main.readyProducts"),
              tag: t("main.calibratedGrid"),
              desc: t("main.readyDesc"),
              cta: t("main.goToCollection"),
              chips: [
                t("main.shippingIn24h"),
                t("main.readyPremiumFabrics"),
                t("main.wideAssortment"),
                t("main.wideSizeGrid"),
              ],
              delay: 120,
            },
          ].map((card) => (
            <Reveal key={card.to} delay={card.delay}>
              <Link
                to={card.to}
                className="group relative flex min-h-[34rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-stone-900 p-7 text-white shadow-[0_30px_60px_-30px_rgba(28,25,23,0.6)] sm:min-h-[38rem] sm:p-10"
              >
                <img
                  src={optimizeCloudinaryUrl(card.img, { width: 900 })}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/5" />

                <div className="relative z-10">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/90 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-beige-300" />
                    {card.tag}
                  </span>
                  <h3 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                    {card.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-stone-300">
                    {card.desc}
                  </p>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {card.chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-stone-200"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>

                  <span className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-stone-900 transition-colors duration-300 group-hover:bg-beige-200">
                    {card.cta}
                    <HiArrowLongRight
                      size={20}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section className="border-y border-stone-200/70 bg-beige-100/60 py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-500">
                {t("main.processKicker")}
              </p>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
                {t("main.processTitle")}
              </h2>
            </div>
            <Link
              to="/individual-tailoring/step-1"
              className="group inline-flex items-center gap-2 self-start rounded-full bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-stone-800 lg:self-auto"
            >
              {t("main.processCta")}
              <HiArrowLongRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </Reveal>

          <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <Reveal as="li" key={n} delay={i * 90}>
                <div className="relative h-full overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_20px_40px_-20px_rgba(28,25,23,0.25)]">
                  <span className="font-display text-6xl font-semibold leading-none text-beige-300">
                    {String(n).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-base font-bold text-stone-900">
                    {t(`individualTailoring.step${n}Title`)}
                  </h3>
                  <p className="mt-2 text-xs font-medium leading-relaxed text-stone-500">
                    {t(`individualTailoring.step${n}Desc`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= FEATURED READY-MADE ================= */}
      <FeaturedProducts />

      {/* ================= ABOUT ================= */}
      <section
        id="about"
        className="mx-auto max-w-7xl px-6 py-32 lg:px-8 border-t border-stone-200/40"
      >
        <div className="relative overflow-hidden rounded-[2.5rem] bg-stone-900 text-white p-8 sm:p-12 lg:p-16 border border-stone-800 group">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-beige-300/10 blur-[100px] group-hover:bg-beige-300/20 group-hover:scale-150 transition-all duration-1000 ease-out" />
          <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-stone-500/20 blur-[100px] group-hover:translate-x-20 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-30 mix-blend-overlay" />

          <div className="relative z-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-10 lg:mb-14">
              <img
                src={logoMini}
                alt="K.I.RICH"
                className="h-20 w-20 object-contain"
              />
              <span className="self-start rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80 backdrop-blur-md">
                K.I.RICH SEWING STUDIO
              </span>
            </div>

            <div className="max-w-4xl mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter leading-[1.1] mb-4">
                {t("main.engineeringTitle")}
              </h2>
              <p className="text-sm sm:text-base text-stone-400 font-medium leading-relaxed">
                {t("main.engineeringTagline")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
              <article className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                    <HiOutlineFlag size={18} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {t("main.philosophyMissionTitle")}
                  </h3>
                </div>
                <p className="text-sm text-stone-400 leading-relaxed font-medium">
                  {t("main.philosophyMissionDesc")}
                </p>
              </article>

              <article className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                    <HiOutlineEye size={18} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {t("main.philosophyVisionTitle")}
                  </h3>
                </div>
                <p className="text-sm text-stone-400 leading-relaxed font-medium">
                  {t("main.philosophyVisionDesc")}
                </p>
              </article>
            </div>

            <div className="mt-12 lg:mt-16 pt-10 border-t border-white/10">
              <h3 className="text-lg font-semibold tracking-tight mb-8">
                {t("main.philosophyValuesTitle")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <IoManOutline size={18} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-3">
                    {t("main.philosophyValue1Title")}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-medium">
                    {t("main.philosophyValue1Desc")}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <IoTimeOutline size={18} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-3">
                    {t("main.philosophyValue2Title")}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-medium">
                    {t("main.philosophyValue2Desc")}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <HiOutlineHeart size={18} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-3">
                    {t("main.philosophyValue3Title")}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-medium">
                    {t("main.philosophyValue3Desc")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 lg:mt-16 pt-10 border-t border-white/10">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-beige-200/10 border border-beige-200/20 text-beige-200">
                  <RiVipCrown2Line size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight mb-4">
                    {t("main.philosophyManifestoTitle")}
                  </h3>
                  <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-medium">
                    {t("main.philosophyManifestoDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
