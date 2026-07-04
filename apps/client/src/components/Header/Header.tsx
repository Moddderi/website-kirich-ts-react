import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Portal } from "../shared/Portal/Portal";

import { IoBagHandleOutline } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { MdFavoriteBorder } from "react-icons/md";

import { useAppSelector } from "../../store/store";
import type { CartItem } from "../../store/cartSlice";
import { selectFavoriteItems } from "../../store/favoriteSlice";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const closeMenu = () => setIsMenuOpen(false);
  const toggleLang = () =>
    i18n.changeLanguage(i18n.language === "uk" ? "en" : "uk");

  const cartItems = useAppSelector(
    (state: { cart: { items: CartItem[] } }) => state.cart.items,
  );

  const totalItemsCount = cartItems.reduce(
    (acc: number, item: CartItem) => acc + item.quantity,
    0,
  );

  const favoriteItems = useAppSelector(selectFavoriteItems);

  return (
    <>
      <div className="bg-stone-900 p-4 px-4 py-2.5 text-center relative overflow-hidden group">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] animate-[pulse_3s_linear_infinite] group-hover:bg-[length:300px_300px] transition-all duration-1000"></div>
        <p className="text-xs font-medium text-white tracking-widest relative z-10 uppercase animate-reveal-up">
          {t("header.topBar")}
          <a
            href="#"
            className="underline underline-offset-4 decoration-stone-500 hover:decoration-white transition-colors ml-2"
          >
            {t("header.topBarLink")}
          </a>
        </p>
      </div>

      <nav className="sticky top-0 z-50 border-b border-stone-200/50 bg-beige-50/80 backdrop-blur-3xl transition-all duration-500">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between animate-reveal-up delay-100">
            <div className="flex-shrink-0">
              <NavLink
                to="/"
                onClick={closeMenu}
                className="text-xl font-semibold tracking-tighter text-stone-900 flex items-baseline gap-2 group"
              >
                K.I.RICH
                <span className="text-xs font-medium text-stone-400 tracking-widest group-hover:text-stone-900 transition-colors duration-500">
                  POLTAVA
                </span>
              </NavLink>
            </div>

            <div className="hidden md:flex md:items-center md:gap-10">
              <NavLink
                to="/catalog"
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors magnetic-link ${
                    isActive
                      ? "text-stone-900 after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[2px] after:bg-stone-900 after:content-['']"
                      : "text-stone-500 hover:text-stone-900"
                  }`
                }
              >
                {t("header.catalog")}
              </NavLink>
              <NavLink
                to="/individual-tailoring"
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors magnetic-link ${
                    isActive
                      ? "text-stone-900 after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[2px] after:bg-stone-900 after:content-['']"
                      : "text-stone-500 hover:text-stone-900"
                  }`
                }
              >
                {t("header.tailoring")}
              </NavLink>

            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <button
                onClick={toggleLang}
                className="flex items-center h-7 rounded-full border border-stone-200 bg-white/60 p-0.5 transition-colors duration-300 hover:border-stone-300"
              >
                <span
                  className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 ${
                    i18n.language === "uk"
                      ? "bg-stone-900 text-white shadow-sm"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  UA
                </span>
                <span
                  className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 ${
                    i18n.language === "en"
                      ? "bg-stone-900 text-white shadow-sm"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  EN
                </span>
              </button>

              <Link
                to="/favorite"
                className="text-stone-400 hover:text-stone-900 transition-colors flex items-center relative transform hover:scale-110 duration-300 group"
              >
                <MdFavoriteBorder size={26} />
                {favoriteItems.length > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-[10px] font-semibold text-white ring-2 ring-beige-50 group-hover:scale-125 transition-transform duration-500">
                    {favoriteItems.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="text-stone-400 hover:text-stone-900 transition-colors flex items-center relative transform hover:scale-110 duration-300 group"
              >
                <IoBagHandleOutline size={26} />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-[10px] font-semibold text-white ring-2 ring-beige-50 group-hover:scale-125 transition-transform duration-500">
                    {totalItemsCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsMenuOpen(true)}
                className="flex md:hidden text-stone-900 hover:text-stone-700 transition-colors items-center transform hover:scale-110 duration-300"
              >
                <GiHamburgerMenu size={26} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex justify-end">
            <div
              className="absolute inset-0 bg-stone-950/40 transition-opacity duration-500"
              onClick={closeMenu}
            />

            <div className="relative w-full sm:w-[400px] max-w-full bg-stone-900/90 backdrop-blur-2xl h-full p-8 pt-17 sm:p-10 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 animate-reveal-up overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-12">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-stone-400 uppercase">
                    {t("header.navigation")}
                  </span>
                  <button
                    onClick={closeMenu}
                    type="button"
                    className="p-2 -mr-2 text-stone-400 hover:text-white rounded-full hover:bg-white/5 transition-all duration-300 active:scale-95"
                  >
                    <IoMdClose size={22} />
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  <NavLink
                    to="/catalog"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `group relative text-2xl font-light tracking-wide py-1 transition-colors duration-500 block ${
                        isActive
                          ? "text-white font-normal"
                          : "text-stone-400 hover:text-white"
                      }`
                    }
                  >
                    <span className="relative z-10">{t("header.catalog")}</span>
                    <span className="absolute left-0 bottom-0 h-[1px] bg-white transition-all duration-500 w-0 group-hover:w-full [.active_&]:w-full" />
                  </NavLink>

                  <NavLink
                    to="/individual-tailoring"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `group relative text-2xl font-light tracking-wide py-1 transition-colors duration-500 block ${
                        isActive
                          ? "text-white font-normal"
                          : "text-stone-400 hover:text-white"
                      }`
                    }
                  >
                    <span className="relative z-10">{t("header.tailoring")}</span>
                    <span className="absolute left-0 bottom-0 h-[1px] bg-white transition-all duration-500 w-0 group-hover:w-full [.active_&]:w-full" />
                  </NavLink>
                </div>
              </div>

              <div className="flex flex-col gap-8 pt-8 border-t border-white/10">
                <div className="flex flex-col gap-3.5">
                  <NavLink
                    to="delivery-and-payment"
                    onClick={closeMenu}
                    className="text-xs font-medium text-stone-400 hover:text-white tracking-wider transition-colors duration-300"
                  >
                    {t("header.deliveryAndPayment")}
                  </NavLink>
                  <NavLink
                    to="privacy-policy"
                    onClick={closeMenu}
                    className="text-xs font-medium text-stone-400 hover:text-white tracking-wider transition-colors duration-300"
                  >
                    {t("header.privacyPolicy")}
                  </NavLink>
                </div>

                <div className="text-[9px] text-stone-500 font-bold tracking-[0.4em] uppercase text-center pt-2">
                  K.I.RICH • POLTAVA
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};
