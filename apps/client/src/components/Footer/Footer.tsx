import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LuArrowUpRight,
  LuFacebook,
  LuInstagram,
  LuMail,
  LuMapPin,
  LuPhone,
  LuSend,
} from "react-icons/lu";
import logoMini from "../../assets/logo-mini.png";
import { CATALOG_ENABLED } from "../../constants/features";

const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://www.instagram.com/k.i.rich_sewing_studio/", icon: LuInstagram },
  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=100068277892798", icon: LuFacebook },
  { name: "Telegram", href: "https://t.me/KirichIrina", icon: LuSend },
] as const;

const linkClass =
  "text-sm font-medium text-stone-400 transition-colors hover:text-white";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="palette-original relative overflow-hidden border-t border-white/5 bg-stone-950 text-white">
      <span aria-hidden className="shine-line absolute inset-x-0 top-0" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-beige-500/60 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-20">
          <div className="max-w-md space-y-7">
            <Link
              to="/"
              className="inline-block transition-opacity duration-300 hover:opacity-80"
              aria-label="K.I.RICH POLTAVA"
            >
              <img
                src={logoMini}
                alt="K.I.RICH POLTAVA"
                width={64}
                height={64}
                loading="lazy"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-stone-400">
              {t("footer.brandDescription")}
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-stone-300 transition-all duration-300 hover:border-accent hover:bg-accent hover:text-[#fff]"
                >
                  <Icon size={18} strokeWidth={1.6} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-beige-400">
              {t("footer.collections")}
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              {CATALOG_ENABLED && (
                <li>
                  <Link to="/catalog" className={linkClass}>
                    {t("footer.newArrivals")}
                  </Link>
                </li>
              )}
              <li>
                <Link to="/individual-tailoring" className={linkClass}>
                  {t("footer.womenLine")}
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className={linkClass}>
                  {t("footer.myOrders")}
                </Link>
              </li>
              <li>
                <Link to="/delivery-and-payment" className={linkClass}>
                  {t("footer.deliveryAndPayment")}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className={linkClass}>
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-beige-400">
              {t("footer.service")}
            </h3>
            <ul role="list" className="mt-6 space-y-5">
              <li className="flex items-start gap-3">
                <LuPhone size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <a href="tel:+380508344955" className={linkClass}>
                    {t("footer.phone")}
                  </a>
                  <p className="mt-1 text-xs text-stone-500">
                    {t("footer.phoneMessengers")}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <LuMapPin size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-accent" />
                <p className="text-sm font-medium text-stone-400">
                  {t("footer.address")}
                </p>
              </li>
              <li className="flex items-start gap-3">
                <LuMail size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-accent" />
                <a
                  href="mailto:kirich.sewing.studio@gmail.com"
                  className={`${linkClass} break-all`}
                >
                  {t("footer.email")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
              <span className="h-1.5 w-1.5 rotate-45 bg-beige-500" />
              {t("footer.madeInUkraine")}
            </span>
            <a
              href="https://olehkyrych.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 transition-colors hover:text-white"
            >
              {t("footer.developedBy")} Kyrychenko Oleh
              <LuArrowUpRight
                size={13}
                strokeWidth={1.8}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
