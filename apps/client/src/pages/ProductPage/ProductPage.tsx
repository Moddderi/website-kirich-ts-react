import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@project/shared";
import { SUBTYPE_LABELS } from "@project/shared";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addToCart } from "../../store/cartSlice";
import { toggleFavorite, selectIsFavorite } from "../../store/favoriteSlice";
import { SizeChartModal } from "../../components/SizeChartModal/SizeChartModal";
import { ColorPaletteModal } from "../../components/ColorPaletteModal/ColorPaletteModal";

import { IoBagHandleOutline } from "react-icons/io5";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineArrowLeft } from "react-icons/hi";

import { getProductById } from "../../api/productApi";
import { useTranslation } from "react-i18next";
import { useProductName } from "../../utils/useLocalizedProduct";
import { useFormattedPrice } from "../../hooks/useFormattedPrice";
import {
  getSizesForGroup,
  type SizeGroup,
} from "../../constants/sizeCharts";
import { resolveProductColors } from "../../constants/colorPalette";

export const ProductPage: React.FC = () => {
  const { t } = useTranslation();
  const getProductName = useProductName();
  const formatPrice = useFormattedPrice();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [sizeGroup, setSizeGroup] = useState<SizeGroup>("men");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);

  const availableSizes = getSizesForGroup(sizeGroup);

  const handleSizeGroupChange = (group: SizeGroup) => {
    if (group === sizeGroup) return;
    setSizeGroup(group);
    const nextSizes = getSizesForGroup(group);
    setSelectedSize(nextSizes[Math.floor(nextSizes.length / 2)] ?? nextSizes[0]);
  };

  // Стейт для активной (выбранной) картинки в галерее
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product, Error>({
    queryKey: ["productFull", id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });

  const productColorIds = product?.colors ?? [];
  const productColors = resolveProductColors(productColorIds);
  const AVAILABLE_COLORS = productColors.map((color) => ({
    ...color,
    label: t(`productPage.colors.${color.id}`, {
      defaultValue: t(`productPage.paletteColors.${color.id}`, {
        defaultValue: color.id,
      }),
    }),
  }));
  const activeColorId = productColorIds.includes(selectedColor)
    ? selectedColor
    : (productColorIds[0] ?? "");

  // Проверяем, находится ли текущий товар в избранном
  const isFavorite = useAppSelector(selectIsFavorite(product?.id ?? 0));

  // Безопасное извлечение массива картинок
  const images =
    product && Array.isArray(product.imageUrl) ? product.imageUrl : [];
  const defaultImage =
    "https://res.cloudinary.com/dqe2odzsc/image/upload/default.jpg";
  const displayImages = images.length > 0 ? images : [defaultImage];

  // Обработчик клика «ДОБАВИТЬ В КОРЗИНУ»
  // Обработчик клика «ДОБАВИТЬ В КОРЗИНУ»
  const handleAddToCart = () => {
    if (!product) return;

    const colorObj = AVAILABLE_COLORS.find((c) => c.id === activeColorId);
    const colorLabel = colorObj ? colorObj.label : activeColorId || undefined;

    dispatch(
      addToCart({
        productId: product.id.toString(),
        name: product.name,
        name_en: product.name_en,
        price: product.price,
        // Передаем массив из одного элемента (текущую выбранную картинку),
        // чтобы соответствовать типу string[] в CartItem
        imageUrl: [displayImages[activeImageIndex]],
        productCode: product.product_code,
        options: {
          color: colorLabel,
          size: selectedSize,
        },
      }),
    );

    navigate("/cart");
  };

  // Обработчик добавления/удаления из избранного
  const handleToggleFavorite = () => {
    if (!product) return;
    dispatch(toggleFavorite(product));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-stone-500 font-medium text-sm">
        <span className="animate-pulse">{t("productPage.loading")}</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold text-stone-900 mb-2">
          {t("productPage.error")}
        </h2>
        <p className="text-stone-500 text-sm mb-6">
          {error?.message || t("productPage.notFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16 animate-reveal-up">
      {/* КНОПКА НАЗАД ВМЕСТО ХЛЕБНЫХ КРОШЕК */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 bg-stone-50 border border-stone-200/60 hover:bg-white hover:border-stone-900 hover:text-stone-900 px-5 py-3.5 rounded-2xl transition-all duration-300 active:scale-95 shadow-xs"
        >
          <HiOutlineArrowLeft size={16} />
          {t("productPage.backToCatalog")}
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        {/* ЛЕВАЯ ЧАСТЬ — ГАЛЕРЕЯ С ПРЕВЬЮ */}
        <div className="lg:col-span-7 flex flex-col gap-4 relative">
          {/* Главное изображение */}
          <div className="aspect-3/4 w-full overflow-hidden rounded-[2.5rem] bg-stone-200 border border-stone-200/60 relative group">
            <div className="absolute inset-0 bg-stone-300 transition-transform duration-1000">
              <div className="w-full h-full bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-size-[2rem_2rem] mix-blend-multiply opacity-50"></div>
              <img
                className="w-full h-full absolute inset-0 object-cover"
                src={displayImages[activeImageIndex]}
                alt={`${getProductName(product)} — ${t("productCard.angle", { n: activeImageIndex + 1 })}`}
                crossOrigin="anonymous"
              />
            </div>
          </div>

          {/* Превью (отображаются только если картинок больше одной) */}
          {displayImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3 w-full">
              {displayImages.map((url, index) => {
                const isActive = activeImageIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-3/4 w-full rounded-2xl overflow-hidden bg-stone-200 border-2 relative transition-all ${
                      isActive
                        ? "border-stone-900 shadow-md"
                        : "border-transparent hover:border-stone-300 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Превью ${index + 1}`}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ПРАВАЯ ЧАСТЬ — ИНФОРМАЦИЯ И ОПЦИИ */}
        <div className="mt-10 px-2 sm:px-0 lg:mt-0 lg:col-span-5 relative">
          <div className="sticky top-32">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-sm border border-stone-800">
                  {SUBTYPE_LABELS[product.sub_type] || product.sub_type}
                </span>
                <span className="text-xs font-semibold text-stone-400 flex items-center gap-1.5 uppercase tracking-widest">
                  {t("productPage.days")}
                </span>
                {product.product_code && (
                  <span className="text-[10px] font-medium text-stone-400 tracking-wider ml-auto">
                    {t("productPage.article")}: {product.product_code}
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-stone-900 mb-4">
                {getProductName(product)}
              </h1>
              <p className="text-2xl font-semibold text-stone-900 mb-6">
                 {formatPrice(Number(product.price))}
              </p>
              <p className="text-sm font-medium text-stone-500 leading-relaxed">
                {t("productPage.description")}
              </p>
            </div>

            <div className="space-y-10 border-t border-stone-200/60 pt-10">
              {/* МАТЕРИАЛ ОСНОВЫ */}
              {AVAILABLE_COLORS.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-900">
                    {t("productPage.baseMaterial")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsPaletteOpen(true)}
                    className="text-xs font-medium text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-900 transition-colors"
                  >
                    {t("productPage.palette")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {AVAILABLE_COLORS.map((color) => {
                    const isColorSelected = activeColorId === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color.id)}
                        title={color.label}
                        className="group relative w-12 h-12 rounded-full flex items-center justify-center focus:outline-none transition-transform active:scale-95"
                      >
                        <span
                          className={`absolute inset-0 rounded-full border-2 transition-all ${
                            isColorSelected
                              ? "border-stone-900 scale-100"
                              : "border-transparent scale-75 group-hover:scale-90 group-hover:border-stone-300"
                          }`}
                        ></span>
                        <span
                          className={`w-10 h-10 rounded-full shadow-sm group-hover:scale-95 transition-transform ${
                            color.id === "milky" || color.id === "white"
                              ? "ring-1 ring-stone-200"
                              : ""
                          }`}
                          style={{ backgroundColor: color.hex }}
                        ></span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[11px] font-medium text-stone-400">
                  {AVAILABLE_COLORS.find((c) => c.id === activeColorId)?.label}
                </p>
              </div>
              )}

              {/* ВЫБОР РАЗМЕРА */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-900">
                    {t("productPage.size")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-xs font-medium text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-900 transition-colors"
                  >
                    {t("productPage.sizeChart")}
                  </button>
                </div>

                <div className="mb-4 inline-flex items-center rounded-full border border-stone-200 bg-stone-100 p-1">
                  <button
                    type="button"
                    onClick={() => handleSizeGroupChange("men")}
                    className={`rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                      sizeGroup === "men"
                        ? "bg-stone-900 text-white shadow-sm"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    {t("productPage.sizeChartMen")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSizeGroupChange("kids")}
                    className={`rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                      sizeGroup === "kids"
                        ? "bg-stone-900 text-white shadow-sm"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    {t("productPage.sizeChartKids")}
                  </button>
                </div>

                {sizeGroup === "kids" && (
                  <p className="mb-3 text-[11px] font-medium text-stone-400">
                    {t("productPage.sizeChartKidsHint")}
                  </p>
                )}

                <div className="flex flex-wrap gap-2.5">
                  {availableSizes.map((size) => {
                    const isSizeSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-14 h-12 rounded-2xl border text-xs font-bold transition-all tracking-wider flex items-center justify-center px-3 active:scale-95 ${
                          isSizeSelected
                            ? "border-stone-900 bg-stone-900 text-white"
                            : "border-stone-200 bg-white/50 text-stone-900 hover:border-stone-900 hover:bg-white"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* КНОПКИ ДЕЙСТВИЯ */}
            <div className="mt-12 flex gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 rounded-2xl bg-stone-900 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white shadow-[0_8px_30px_rgba(28,25,23,0.12)] hover:bg-stone-800 hover:shadow-[0_8px_30px_rgba(28,25,23,0.2)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                <IoBagHandleOutline size={18} /> {t("productPage.addToCart")}
              </button>

              {/* КНОПКА ИЗБРАННОГО */}
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 active:scale-95 shadow-sm ${
                  isFavorite
                    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-stone-200 bg-white text-stone-400 hover:text-stone-900 hover:border-stone-900"
                }`}
                title={isFavorite ? t("productPage.removeFromFavorites") : t("productPage.addToFavorites")}
              >
                {isFavorite ? (
                  <IoHeart size={22} className="text-red-500" />
                ) : (
                  <IoHeartOutline size={22} />
                )}
              </button>
            </div>

            {/* ДЕТАЛИ И УХОД */}
            <div className="mt-12 border-t border-stone-200/60 divide-y divide-stone-200/60">
              <details className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold tracking-tight text-stone-900 marker:content-none select-none">
                  {t("productPage.processDescription")}
                  <IoIosArrowDown className="text-stone-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-sm font-medium text-stone-500 leading-relaxed pr-8">
                  {t("productPage.processText")}
                </div>
              </details>
              <details className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold tracking-tight text-stone-900 marker:content-none select-none">
                  {t("productPage.foreignCurrencyTitle")}
                  <IoIosArrowDown className="text-stone-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-sm font-medium text-stone-500 leading-relaxed pr-8">
                  {t("productPage.foreignCurrencyText")}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        selectedSize={selectedSize}
        activeGroup={sizeGroup}
      />

      <ColorPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />
    </div>
  );
};
