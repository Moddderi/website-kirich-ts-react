import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuArrowRight, LuClock, LuHourglass } from "react-icons/lu";
import { HOME_IMAGES } from "../../../constants/homeImages";
import { CATALOG_ENABLED } from "../../../constants/features";
import { optimizeCloudinaryUrl } from "../../../utils/cloudinary";
import { Reveal } from "../../../components/shared/Reveal/Reveal";
import { Spot } from "../../../components/fx/Spot";
import { SectionHead } from "./SectionHead";

export const WaysSection = () => {
  const { t } = useTranslation();

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
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-32">
      <SectionHead
        kicker="K.I.RICH"
        title={t("main.orderArchitecture")}
        desc={t("main.orderArchitectureDesc")}
        center
      />

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
                    ? "opacity-50 grayscale"
                    : "opacity-80 group-hover:scale-105"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/5" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/90 backdrop-blur-sm">
                  {frozen ? (
                    <LuHourglass size={12} strokeWidth={1.8} />
                  ) : (
                    <span className="h-1.5 w-1.5 rotate-45 bg-white" />
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
                  <span className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition-all duration-300 group-hover:shadow-[0_0_40px_-6px_rgba(255,255,255,0.7)]">
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
            "palette-original relative flex min-h-[30rem] flex-col justify-end overflow-hidden rounded-4xl border border-white/10 bg-black p-6 text-white sm:min-h-[38rem] sm:p-10";

          return (
            <Reveal key={card.key} delay={card.delay}>
              <Spot className="rounded-4xl">
                {card.to ? (
                  <Link to={card.to} className={`group ${cardClass}`}>
                    {body}
                  </Link>
                ) : (
                  <div className={cardClass}>{body}</div>
                )}
              </Spot>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};
