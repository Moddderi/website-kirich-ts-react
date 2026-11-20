import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuArrowRight, LuGift } from "react-icons/lu";
import { HOME_IMAGES } from "../../constants/homeImages";
import { Reveal } from "../../components/shared/Reveal/Reveal";

export default function CertificateSection() {
  const { t } = useTranslation();
  const homeImages = HOME_IMAGES;

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="relative isolate">
        <div
          className="pointer-events-none absolute -inset-3 rounded-[2.25rem] bg-linear-to-br from-accent/25 via-transparent to-accent-2/20 opacity-80 blur-2xl sm:-inset-6"
          aria-hidden
        />

        <div className="relative overflow-hidden rounded-[2rem] border border-accent/25 bg-white shadow-[0_32px_100px_-28px_rgba(196,65,77,0.45)] ring-1 ring-accent/10">
          <div
            className="h-1 w-full bg-linear-to-r from-accent via-accent-2 to-accent"
            aria-hidden
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[min(28rem,52vw)]">
            <Reveal
              delay={0}
              className="relative min-h-[17.5rem] overflow-hidden sm:min-h-[20rem] lg:min-h-full"
            >
              <img
                src={homeImages.giftCertificate}
                alt={t("giftCertificate.homeTitle")}
                width={960}
                height={720}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent lg:bg-linear-to-r lg:from-transparent lg:to-accent/10" />
            </Reveal>

            <div className="relative flex flex-col justify-center overflow-hidden border-stone-100 bg-linear-to-br from-accent/[0.08] via-stone-50 to-stone-100 px-6 py-10 sm:px-10 sm:py-12 lg:border-l lg:border-accent/15 lg:px-12 lg:py-14">
              <div
                className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent-2/15 blur-3xl"
                aria-hidden
              />
              <div className="relative z-10">
            <Reveal delay={80}>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-beige-600">
                <LuGift size={14} strokeWidth={2} aria-hidden className="text-accent" />
                {t("giftCertificate.homeKicker")}
              </p>
            </Reveal>
            <Reveal delay={160}>
              <h2 className="font-display text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                {t("giftCertificate.homeTitle")}
              </h2>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-stone-600">
                {t("giftCertificate.homeDesc")}
              </p>
            </Reveal>
            <Reveal delay={320}>
              <ul className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {[t("giftCertificate.homeBullet1"), t("giftCertificate.homeBullet2")].map(
                  (line) => (
                    <li
                      key={line}
                      className="inline-flex rounded-full border border-accent/20 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-stone-800 shadow-sm backdrop-blur-sm"
                    >
                      {line}
                    </li>
                  ),
                )}
              </ul>
            </Reveal>
            <Reveal delay={400}>
              <Link
                to="/gift-certificate"
                className="btn-ember group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-xs font-semibold uppercase tracking-widest shadow-[0_12px_40px_-12px_rgba(196,65,77,0.65)] transition hover:shadow-[0_16px_48px_-10px_rgba(196,65,77,0.75)] sm:w-fit sm:justify-start"
              >
                {t("giftCertificate.homeCta")}
                <LuArrowRight
                  size={16}
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <p className="mt-3 text-center text-[11px] font-medium tracking-wide text-stone-500 sm:text-left">
                {t("giftCertificate.homeCtaHint")}
              </p>
            </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}