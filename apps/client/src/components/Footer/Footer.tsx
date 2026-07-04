import { FaInstagram } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiExternalLinkLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-stone-800 bg-stone-950 relative overflow-hidden text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent"></div>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 relative z-10">
        <div className="xl:grid xl:grid-cols-4 xl:gap-16">
          <div className="space-y-10 xl:col-span-1">
            <a
              href="#"
              className="text-3xl font-semibold tracking-tighter text-white flex items-baseline gap-2"
            >
              K.I.RICH
              <span className="text-xs font-bold text-stone-500 tracking-widest uppercase">
                Poltava
              </span>
            </a>
            <p className="text-sm text-stone-400 max-w-xs leading-relaxed font-medium">
              {t("footer.brandDescription")}
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-800 text-stone-400 hover:bg-white hover:text-stone-900 hover:border-white transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="sr-only">Instagram</span>
                <FaInstagram />
              </a>
              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-800 text-stone-400 hover:bg-white hover:text-stone-900 hover:border-white transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="sr-only">Telegram</span>
                <MdOutlineMailOutline />
              </a>
            </div>

            <div className="mt-12 pt-8 border-t border-stone-800/60 max-w-xs">
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

          <div className="mt-20 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-12">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                  {t("footer.collections")}
                </h3>
                <ul role="list" className="mt-8 space-y-5">
                  <li>
                    <a
                      href="#"
                      className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                    >
                      {t("footer.newArrivals")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                    >
                      {t("footer.womenLine")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                    >
                      {t("footer.menLine")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                    >
                      {t("footer.bespoke")}
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                  {t("footer.service")}
                </h3>
                <ul role="list" className="mt-8 space-y-5">
                  <li>
                    <a
                      href="#"
                      className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                    >
                      {t("footer.globalShipping")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                    >
                      {t("footer.sizeArchitecture")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                    >
                      {t("footer.returns")}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm font-medium text-stone-400 hover:text-white transition-colors magnetic-link relative inline-block"
                    >
                      {t("footer.contactStudio")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-20 xl:mt-0 xl:col-span-1">
            <div className="bg-stone-900 rounded-4xl p-8 border border-stone-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] z-0"></div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest relative z-10">
                Vanguard Club
              </h3>
              <p className="mt-4 text-xs text-stone-400 font-medium relative z-10 leading-relaxed">
                {t("footer.vanguardDesc")}
              </p>
              <form className="mt-6 relative z-10 group-hover:scale-[1.02] transition-transform duration-500">
                <label htmlFor="email-address" className="sr-only">
                  Email
                </label>
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  autoComplete="email"
                  required
                  className="block w-full rounded-2xl border-0 bg-white/5 py-4 pl-5 pr-24 text-sm font-medium text-white shadow-inner ring-1 ring-inset ring-white/10 placeholder:text-stone-500 focus:ring-2 focus:ring-inset focus:ring-white sm:leading-6 transition-all backdrop-blur-sm"
                  placeholder={t("footer.yourEmail")}
                />
                <button
                  type="submit"
                  className="absolute inset-y-1.5 right-1.5 flex items-center justify-center rounded-xl bg-white px-5 text-xs font-bold uppercase tracking-widest text-stone-900 shadow-lg hover:bg-stone-200 transition-colors active:scale-95"
                >
                  {t("footer.join")}
                </button>
              </form>
            </div>
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
