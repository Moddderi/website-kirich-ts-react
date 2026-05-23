import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Portal } from "../shared/Portal/Portal"; // Твой обновленный портал

import { IoBagHandleOutline } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { MdFavoriteBorder } from "react-icons/md";

import { useAppSelector } from "../../store/store"; // Проверь относительный путь до папки store
import type { CartItem } from "../../store/cartSlice";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  // Получаем массив товаров из Redux-стейта
  const cartItems = useAppSelector(
    (state: { cart: { items: CartItem[] } }) => state.cart.items,
  );

  // Считаем общее количество вещей (суммируем quantity каждого товара)
  const totalItemsCount = cartItems.reduce(
    (acc: number, item: CartItem) => acc + item.quantity,
    0,
  );

  return (
    <>
      {/* ВЕРХНЯЯ ИНФО-ПАНЕЛЬ */}
      <div className="bg-stone-900 p-4 px-4 py-2.5 text-center relative overflow-hidden group">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] animate-[pulse_3s_linear_infinite] group-hover:bg-[length:300px_300px] transition-all duration-1000"></div>
        <p className="text-xs font-medium text-white tracking-widest relative z-10 uppercase animate-reveal-up">
          Global Shipping. Створенно в Україні.
          <a
            href="#"
            className="underline underline-offset-4 decoration-stone-500 hover:decoration-white transition-colors ml-2"
          >
            Детальніше
          </a>
        </p>
      </div>

      {/* ОСНОВНАЯ НАВИГАЦИЯ */}
      <nav className="sticky top-0 z-50 border-b border-stone-200/50 bg-beige-50/80 backdrop-blur-3xl transition-all duration-500">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between animate-reveal-up delay-100">
            {/* ЛОГОТИП */}
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

            {/* ДЕСКТОПНОЕ МЕНЮ */}
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
                Каталог
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
                Індивідуальне пошиття
              </NavLink>
            </div>

            {/* ИКОНКИ ДЕЙСТВИЙ */}
            <div className="flex items-center gap-6">
              <button className="text-stone-400 hover:text-stone-900 transition-colors flex items-center relative transform hover:scale-110 duration-300 group">
                <MdFavoriteBorder size={26} />
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white ring-2 ring-beige-50 group-hover:scale-125 transition-transform duration-500">
                  3
                </span>
              </button>
              <Link
                to="/cart"
                className="text-stone-400 hover:text-stone-900 transition-colors flex items-center relative transform hover:scale-110 duration-300 group"
              >
                <IoBagHandleOutline size={26} />

                {/* Рендерим кружок только если в корзине есть хотя бы 1 товар */}
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

      {/* МОБИЛЬНОЕ МЕНЮ (ЧЕРЕЗ ПОРТАЛ) */}
      {isMenuOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Мягкая подложка-оверлей */}
            <div
              className="absolute inset-0 bg-stone-950/40 transition-opacity duration-500"
              onClick={closeMenu}
            />

            {/* Панель меню — глубокое матовое стекло */}
            <div className="relative w-full sm:w-[400px] max-w-full bg-stone-900/90 backdrop-blur-2xl h-full p-8 sm:p-10 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 animate-reveal-up overflow-y-auto">
              {/* ВЕРХНЯЯ ЧАСТЬ: Навигация */}
              <div>
                {/* Шапка меню */}
                <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-12">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-stone-400 uppercase">
                    Навігація
                  </span>
                  <button
                    onClick={closeMenu}
                    type="button"
                    className="p-2 -mr-2 text-stone-400 hover:text-white rounded-full hover:bg-white/5 transition-all duration-300 active:scale-95"
                  >
                    <IoMdClose size={22} />
                  </button>
                </div>

                {/* Главные ссылки с премиальным ховером */}
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
                    <span className="relative z-10">Каталог</span>
                    {/* Элегантная линия подчеркивания при ховере или активном статусе */}
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
                    <span className="relative z-10">Індивідуальне пошиття</span>
                    <span className="absolute left-0 bottom-0 h-[1px] bg-white transition-all duration-500 w-0 group-hover:w-full [.active_&]:w-full" />
                  </NavLink>
                </div>
              </div>

              {/* НИЖНЯЯ ЧАСТЬ: Служебные линки и футер меню */}
              <div className="flex flex-col gap-8 pt-8 border-t border-white/10">
                {/* Дополнительные информационные ссылки */}
                <div className="flex flex-col gap-3.5">
                  <NavLink
                    to="/delivery-and-payment"
                    onClick={closeMenu}
                    className="text-xs font-medium text-stone-400 hover:text-white tracking-wider transition-colors duration-300"
                  >
                    Доставка та оплата
                  </NavLink>
                  <NavLink
                    to="/privacy-policy"
                    onClick={closeMenu}
                    className="text-xs font-medium text-stone-400 hover:text-white tracking-wider transition-colors duration-300"
                  >
                    Політика конфиденційності
                  </NavLink>
                  <NavLink
                    to="/public-offer"
                    onClick={closeMenu}
                    className="text-xs font-medium text-stone-400 hover:text-white tracking-wider transition-colors duration-300"
                  >
                    Публічна оферта
                  </NavLink>
                </div>

                {/* Фирменный футер */}
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
