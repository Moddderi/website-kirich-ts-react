import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuHeart, LuMenu, LuShoppingBag, LuUserRound, LuX } from "react-icons/lu";
import { changeSiteLanguage } from "../../i18n/i18n";
import { Portal } from "../shared/Portal/Portal";

import { useAppSelector } from "../../store/store";
import type { CartItem } from "../../store/cartSlice";
import { selectFavoriteItems } from "../../store/favoriteSlice";
import { getCabinetToken, getSession } from "../../utils/cabinetStorage";
import { CATALOG_ENABLED } from "../../constants/features";
import logoLight from "../../assets/logo-mini.png";

const TICKER_KEYS = ["topBar", "topBar2", "topBar3", "topBar4"] as const;

const ICON_CLASS =
  "relative flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition-colors duration-300 hover:bg-stone-900/5 hover:text-stone-900";

const Badge = ({ count }: { count: number }) =>
  count > 0 ? (
    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] font-semibold leading-none text-beige-50 ring-2 ring-beige-50">
      {count}
    </span>
  ) : null;

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const { t, i18n } = useTranslation();
  const location = useLocation(); // re-render on navigation so the cabinet link stays fresh

  const openMenu = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setIsClosing(false);
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsClosing(true);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
    }, 220);
  };
  const toggleLang = () =>
    changeSiteLanguage(i18n.language === "uk" ? "en" : "uk");

  const cartItems = useAppSelector(
    (state: { cart: { items: CartItem[] } }) => state.cart.items,
  );
  const totalItemsCount = cartItems.reduce(
    (acc: number, item: CartItem) => acc + item.quantity,
    0,
  );
  const favoriteItems = useAppSelector(selectFavoriteItems);

  // Re-read the saved cabinet link on every navigation (saved after checkout / cabinet visit).
  // Signed in → the list of orders; otherwise the last opened order or the sign-in page.
  void location;
  const cabinetToken = getCabinetToken();
  const cabinetPath =
    !getSession() && cabinetToken ? `/my-order/${cabinetToken}` : "/my-orders";

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    `relative text-[13px] font-semibold uppercase tracking-[0.18em] transition-colors magnetic-link ${
      isActive
        ? "text-stone-900 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:bg-accent"
        : "text-stone-500 hover:text-stone-900"
    }`;

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    `block border-b border-white/10 py-5 font-display text-4xl font-medium tracking-tight transition-colors ${
      isActive ? "text-accent" : "text-stone-300 hover:text-white"
    }`;

  return (
    <>
      <Link
        to="/individual-tailoring"
        className="ticker palette-original relative block overflow-hidden bg-stone-900 py-2"
        aria-label={t("header.topBar")}
      >
        <div className="ticker-track flex items-center" aria-hidden="true">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {TICKER_KEYS.map((key) => (
                <span
                  key={`${dup}-${key}`}
                  className="flex items-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80 sm:text-[11px]"
                >
                  <span className="px-6 sm:px-10">{t(`header.${key}`)}</span>
                  <span className="h-1.5 w-1.5 rotate-45 bg-accent shadow-[0_0_10px_2px_rgba(196,65,77,0.7)]" />
                </span>
              ))}
            </div>
          ))}
        </div>
        <span className="shine-line absolute inset-x-0 bottom-0" />
      </Link>

      <nav className="sticky top-0 z-50 border-b border-stone-900/10 bg-beige-50/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex h-16 w-full items-center justify-between sm:h-[4.5rem]">
            <Link
              to="/"
              onClick={closeMenu}
              className="relative z-10 flex shrink-0 items-center"
              aria-label="K.I.RICH POLTAVA"
            >
              <img
                src={logoLight}
                alt="K.I.RICH POLTAVA"
                width={64}
                height={64}
                className="h-11 w-auto object-contain sm:h-12"
              />
            </Link>

            <div className="hidden min-w-0 flex-1 items-center justify-center gap-6 md:flex lg:gap-8 xl:absolute xl:left-1/2 xl:top-1/2 xl:z-0 xl:flex-none xl:-translate-x-1/2 xl:-translate-y-1/2 xl:gap-10">
              {CATALOG_ENABLED && (
                <NavLink to="/catalog" className={desktopLink}>
                  {t("header.catalog")}
                </NavLink>
              )}
              <NavLink to="/individual-tailoring" className={desktopLink}>
                {t("header.tailoring")}
              </NavLink>
            </div>

            <div className="relative z-10 flex shrink-0 items-center gap-0.5 sm:gap-1.5">
              <Link
                to="/individual-tailoring/step-1"
                className="btn-ember mr-1 hidden items-center rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest lg:mr-2 lg:inline-flex lg:px-4 lg:text-xs xl:px-5"
              >
                {t("header.startCta")}
              </Link>
              <button
                type="button"
                onClick={toggleLang}
                aria-label="Language"
                className="mr-1 flex h-8 items-center rounded-full border border-stone-900/15 p-0.5 transition-colors hover:border-stone-900/40"
              >
                {(["uk", "en"] as const).map((lng) => (
                  <span
                    key={lng}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-widest transition-all duration-300 ${
                      i18n.language === lng
                        ? "bg-stone-900 text-beige-50"
                        : "text-stone-400"
                    }`}
                  >
                    {lng === "uk" ? "UA" : "EN"}
                  </span>
                ))}
              </button>

              <Link to="/favorite" className={ICON_CLASS} aria-label={t("header.favorites")}>
                <LuHeart size={21} strokeWidth={1.6} />
                <Badge count={favoriteItems.length} />
              </Link>
              <Link to="/cart" className={ICON_CLASS} aria-label={t("header.cart")}>
                <LuShoppingBag size={21} strokeWidth={1.6} />
                <Badge count={totalItemsCount} />
              </Link>

              <Link
                to={cabinetPath}
                aria-label={t("header.cabinet")}
                title={t("header.cabinet")}
                className={ICON_CLASS}
              >
                <LuUserRound size={21} strokeWidth={1.6} />
              </Link>

              <button
                type="button"
                onClick={openMenu}
                aria-label={t("header.menu")}
                aria-expanded={isMenuOpen}
                className={`${ICON_CLASS} md:hidden`}
              >
                <LuMenu size={23} strokeWidth={1.6} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <Portal>
          <div
            className={`mobile-menu palette-original fixed inset-0 z-[9999] flex flex-col bg-stone-950/80 backdrop-blur-xl ${
              isClosing ? "is-closing" : ""
            }`}
          >
            <div className="relative z-10 flex h-full w-full flex-col justify-between overflow-y-auto p-6 sm:ml-auto sm:w-[420px] sm:p-10">
              <div>
                <div className="mb-10 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-beige-400">
                    {t("header.navigation")}
                  </span>
                  <button
                    onClick={closeMenu}
                    type="button"
                    aria-label={t("header.close")}
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <LuX size={22} strokeWidth={1.6} />
                  </button>
                </div>

                <nav className="border-t border-white/10">
                  <NavLink
                    to="/individual-tailoring"
                    onClick={closeMenu}
                    className={mobileLink}
                  >
                    {t("header.tailoring")}
                  </NavLink>
                  {CATALOG_ENABLED && (
                    <NavLink to="/catalog" onClick={closeMenu} className={mobileLink}>
                      {t("header.catalog")}
                    </NavLink>
                  )}
                  <Link
                    to={cabinetPath}
                    onClick={closeMenu}
                    className="block border-b border-white/10 py-5 font-display text-4xl font-medium tracking-tight text-stone-300 transition-colors hover:text-white"
                  >
                    {t("header.cabinet")}
                  </Link>
                </nav>
              </div>

              <div className="pt-10">
                <Link
                  to="/individual-tailoring/step-1"
                  onClick={closeMenu}
                  className="btn-ember mb-8 flex items-center justify-center rounded-full px-6 py-4 text-sm font-bold uppercase tracking-widest"
                >
                  {t("header.startCta")}
                </Link>
                <div className="flex flex-col gap-4">
                  <NavLink
                    to="/delivery-and-payment"
                    onClick={closeMenu}
                    className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400 transition-colors hover:text-white"
                  >
                    {t("header.deliveryAndPayment")}
                  </NavLink>
                  <NavLink
                    to="/privacy-policy"
                    onClick={closeMenu}
                    className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400 transition-colors hover:text-white"
                  >
                    {t("header.privacyPolicy")}
                  </NavLink>
                </div>
                <p className="mt-10 text-center text-[10px] font-semibold uppercase tracking-[0.4em] text-beige-500/70">
                  K.I.RICH · Poltava
                </p>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};
