import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  removeFromFavorites,
  selectFavoriteItems,
} from "../../store/favoriteSlice";
import { addToCart } from "../../store/cartSlice";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import type { Product } from "@project/shared";

import { IoHeartDislikeOutline } from "react-icons/io5";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { useProductName } from "../../utils/useLocalizedProduct";
import { useFormattedPrice } from "../../hooks/useFormattedPrice";

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const getProductName = useProductName();
  const formatPrice = useFormattedPrice();

  // Достаем избранные товары из Redux-стора
  const favoriteItems = useAppSelector(selectFavoriteItems);

  const handleRemove = (productId: number) => {
    dispatch(removeFromFavorites(productId));
  };

  const handleMoveToCart = (item: Product) => {
    // Безопасно получаем массив картинок (массив или пустой массив)
    const images = Array.isArray(item.imageUrl)
      ? item.imageUrl
      : item.imageUrl
        ? [item.imageUrl]
        : [];

    // Превращаем Product в Omit<CartItem, "quantity" | "cartItemId">
    const cartItemPayload = {
      productId: String(item.id),
      name: item.name,
      name_en: item.name_en,
      price: item.price,
      // Передаем в корзину массив картинок, соответствующий типу string[]
      imageUrl:
        images.length > 0
          ? images
          : ["https://res.cloudinary.com/dqe2odzsc/image/upload/default.jpg"],
      productCode: item.product_code,
      options: {
        color: t("favorites.defaultOption"),
        size: t("favorites.defaultOption"),
      },
    };

    dispatch(addToCart(cartItemPayload));
    dispatch(removeFromFavorites(item.id));
  };

  // Вспомогательная функция для отображения первой картинки товара
  const getDisplayImage = (imageUrl: string | string[] | undefined) => {
    if (!imageUrl)
      return "https://res.cloudinary.com/dqe2odzsc/image/upload/default.jpg";
    return Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-24 animate-reveal-up">
      <Breadcrumbs />

      <div className="mt-4">
        {/* Заголовок */}
        <div className="flex items-baseline gap-6 sm:gap-10 mb-12 border-b border-stone-200/60 pb-6 overflow-x-auto no-scrollbar">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-stone-900 relative whitespace-nowrap">
            {t("favorites.title")}
            <span className="text-stone-400 font-medium normal-case ml-1 text-xl sm:text-2xl">
              ({favoriteItems.length})
            </span>
            <div className="absolute -bottom-6.25 left-0 right-0 h-0.5 bg-stone-900"></div>
          </h1>
        </div>

        {/* СПИСОК ТОВАРОВ */}
        {favoriteItems.length === 0 ? (
          <div className="py-12 text-stone-500 text-sm font-medium">
            {t("favorites.empty")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favoriteItems.map((item: Product) => (
              <div
                key={item.id}
                className="flex flex-col bg-white border border-stone-200/60 rounded-3xl overflow-hidden group animate-reveal-up relative transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(28,25,23,0.1)]"
              >
                {/* ИЗОБРАЖЕНИЕ ТОВАРА */}
                <div
                  onClick={() => navigate(`/catalog/${item.id}`)}
                  className="relative aspect-3/4 w-full bg-stone-100 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  <img
                    src={getDisplayImage(item.imageUrl)}
                    alt={getProductName(item)}
                    className="w-full h-full group-hover: transition-duration-500 object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="w-full h-full absolute bg-linear-to-tr from-stone-400/10 via-beige-100/30 to-white/40 mix-blend-overlay pointer-events-none"></div>
                </div>

                {/* Описание */}
                <div className="flex flex-col p-6 grow justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3
                          onClick={() => navigate(`/catalog/${item.id}`)}
                          className="text-lg font-semibold text-stone-900 cursor-pointer hover:underline underline-offset-4"
                        >
                          {getProductName(item)}
                        </h3>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-stone-500 mt-0.5">
                          {t("favorites.article")}: {item.product_code}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1 -mr-1"
                        type="button"
                        title={t("favorites.removeFromFavorites")}
                      >
                        <IoHeartDislikeOutline size={20} />
                      </button>
                    </div>

                    <p className="text-xl font-semibold text-stone-900 mb-4">
                      {formatPrice(Number(item.price))}
                    </p>
                  </div>

                  {/* Кнопка добавления в корзину */}
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full rounded-xl border border-stone-900 bg-stone-900 py-3 px-6 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white hover:text-stone-900 transition-all duration-300 flex items-center justify-center gap-2 group/btn active:scale-95"
                  >
                    <HiOutlineShoppingBag
                      size={16}
                      className="text-white group-hover/btn:text-stone-900 transition-colors"
                    />
                    {t("favorites.toCart")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
