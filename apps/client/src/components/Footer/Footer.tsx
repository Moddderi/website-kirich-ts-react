import { FaFacebook, FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { RiExternalLinkLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoMini from "../../assets/logo-mini.png";

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/k.i.rich_sewing_studio/",
  facebook: "https://www.facebook.com/profile.php?id=100068277892798",
  telegram: "https://t.me/KirichIrina",
} as const;

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-stone-800 bg-stone-950 relative overflow-hidden text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent"></div>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 xl:grid-cols-3 xl:gap-20">
          <div className="space-y-10 max-w-md">
            <Link
              to="./"
              className="inline-block transition-opacity duration-300 hover:opacity-80"
              aria-label="K.I.RICH POLTAVA"
            >
              <img
                src={logoMini}
                alt="K.I.RICH POLTAVA"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed font-medium">
              {t("footer.brandDescription")}
            </p>
            <div className="flex gap-4">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-800 text-stone-400 hover:bg-white hover:text-stone-900 hover:border-white transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="sr-only">Instagram</span>
                <FaInstagram size={20} />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-800 text-stone-400 hover:bg-white hover:text-stone-900 hover:border-white transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="sr-only">Facebook</span>
                <FaFacebook size={20} />
              </a>
              <a
                href={SOCIAL_LINKS.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-800 text-stone-400 hover:bg-white hover:text-stone-900 hover:border-white transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="sr-only">Telegram</span>
                <FaTelegramPlane size={20} />
              </a>
            </div>

            <div className="mt-12 pt-8 border-t border-stone-800/60 max-w-sm">
              <a
                href="https://my-portfolio-app-two-hazel.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group/author flex flex-col gap-3 p-4 bg-stone-900/50 border border-stone-800 rounded-3xl hover:bg-stone-800/60 hover:border-stone-700 transition-all duration-300"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 group-hover/author:text-stone-400 transition-colors">
                  {t("footer.developedBy")}
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white group-hover/author:text-stone-200 transition-colors underline decoration-stone-600 underline-offset-4 group-hover/author:decoration-stone-300">
                    Kyrychenko Oleh
                  </span>

                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-stone-800 border border-stone-700 text-stone-400 group-hover/author:bg-[#e0d5c1] group-hover/author:border-[#e0d5c1] group-hover/author:text-stone-950 transition-all duration-300">
                    <RiExternalLinkLine size={12} />
                  </span>
                </div>
              </a>
            </div>
          </div>

          <div className="md:mt-0">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">
              {t("footer.collections")}
            </h3>
            <ul role="list" className="mt-8 space-y-5">
              <li>
                <Link
                  to="/catalog"
                  className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                >
                  {t("footer.newArrivals")}
                </Link>
              </li>
              <li>
                <Link
                  to="/individual-tailoring"
                  className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                >
                  {t("footer.womenLine")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:mt-0 min-w-[260px]">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">
              {t("footer.service")}
            </h3>
            <ul role="list" className="mt-8 space-y-5">
              <li>
                <a
                  href="tel:+380508344955"
                  className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                >
                  {t("footer.phone")}
                </a>
                <p className="mt-1 text-xs text-stone-500">
                  {t("footer.phoneMessengers")}
                </p>
              </li>
              <li>
                <p className="text-sm font-medium text-stone-400">
                  {t("footer.address")}
                </p>
              </li>
              <li>
                <a
                  href="mailto:kirich.sewing.studio@gmail.com"
                  className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                >
                  {t("footer.email")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between border-t border-stone-800 pt-10">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="mt-6 md:mt-0 flex gap-8 text-xs font-semibold text-stone-500 uppercase tracking-widest">
            <Link
              to="delivery-and-payment"
              className="hover:text-white transition-colors"
            >
              {t("footer.deliveryAndPayment")}
            </Link>
            <Link
              to="privacy-policy"
              className="hover:text-white transition-colors"
            >
              {t("footer.privacyPolicy")}
            </Link>
            <span className="flex items-center gap-1.5 text-stone-400">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              {t("footer.madeInUkraine")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
