import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@project/shared";
import { SUBTYPE_LABELS } from "@project/shared";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { addToCart } from "../../store/cartSlice";
import { setReadyAccessoryQuantity } from "../../store/tailoringSlice";
import { toggleFavorite, selectIsFavorite } from "../../store/favoriteSlice";
import { SizeChartModal } from "../../components/SizeChartModal/SizeChartModal";
import { ColorPaletteModal } from "../../components/ColorPaletteModal/ColorPaletteModal";


import {
  findProductInListCache,
  productQueryOptions,
} from "../../api/productQueries";
import { optimizeCloudinaryUrl } from "../../utils/cloudinary";
import { useTranslation } from "react-i18next";
import { useProductName } from "../../utils/useLocalizedProduct";
import { useFormattedPrice } from "../../hooks/useFormattedPrice";
import {
  getSizesForGroup,
  type SizeGroup,
} from "../../constants/sizeCharts";
import { resolveProductColors } from "../../constants/colorPalette";
import { LuArrowLeft, LuChevronDown, LuHeart, LuShoppingBag } from "react-icons/lu";

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

  const queryClient = useQueryClient();

  // placeholderData: if the card was already loaded in the catalog, show it
  // immediately and refresh the full record in the background.
  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product, Error>({
    ...productQueryOptions(id ?? ""),
    enabled: !!id,
    placeholderData: () => findProductInListCache(queryClient, id),
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
  const readyAccessories = useAppSelector(
    (state) => state.tailoring.readyAccessories,
  );
  const isAccessory = product?.main_category === "accessories";
  const tailoringQty = isAccessory
    ? (readyAccessories.find((line) => line.productId === String(product?.id))
        ?.quantity ?? 0)
    : 0;

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
          size: isAccessory ? t("productPage.oneSize") : selectedSize,
        },
      }),
    );

    navigate("/cart");
  };

  const handleAddToTailoring = () => {
    if (!product || tailoringQty >= 5) return;
    dispatch(
      setReadyAccessoryQuantity({
        productId: String(product.id),
        quantity: tailoringQty + 1,
      }),
    );
  };

  // Обработчик добавления/удаления из избранного
  const handleToggleFavorite = () => {
    if (!product) return;
    dispatch(toggleFavorite(product));
  };

  if (isLoading) {
    return (
      <div
        className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16"
        aria-busy="true"
        aria-label={t("productPage.loading")}
      >
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-7 aspect-3/4 w-full rounded-4xl bg-stone-200 animate-pulse" />
          <div className="mt-10 lg:mt-0 lg:col-span-5 space-y-4">
            <div className="h-4 w-24 rounded-full bg-stone-200 animate-pulse" />
            <div className="h-10 w-3/4 rounded-xl bg-stone-200 animate-pulse" />
            <div className="h-8 w-32 rounded-xl bg-stone-200 animate-pulse" />
            <div className="h-40 w-full rounded-3xl bg-stone-200 animate-pulse" />
          </div>
        </div>
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
          className="inline-flex items-center gap-2 rounded-2xl border border-stone-900/15 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-600 transition-all duration-300 hover:border-stone-900 hover:text-stone-900 active:scale-95"
        >
          <LuArrowLeft size={16} />
          {t("productPage.backToCatalog")}
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        {/* ЛЕВАЯ ЧАСТЬ — ГАЛЕРЕЯ С ПРЕВЬЮ */}
        <div className="lg:col-span-7 flex flex-col gap-4 relative">
          {/* Главное изображение */}
          <div className="relative aspect-3/4 w-full overflow-hidden rounded-4xl border border-stone-900/10 bg-stone-900/[0.04] group">
            <div className="absolute inset-0">
              <img
                className="w-full h-full absolute inset-0 object-cover"
                src={optimizeCloudinaryUrl(displayImages[activeImageIndex], {
                  width: 900,
                })}
                alt={`${getProductName(product)} — ${t("productCard.angle", { n: activeImageIndex + 1 })}`}
                fetchPriority="high"
                decoding="async"
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
                    className={`relative aspect-3/4 w-full overflow-hidden rounded-2xl border-2 bg-stone-900/[0.04] transition-all ${
                      isActive
                        ? "border-accent"
                        : "border-transparent opacity-80 hover:border-stone-900/30 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={optimizeCloudinaryUrl(url, { width: 240 })}
                      alt={`Превью ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
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
                <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent">
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
                  {!isAccessory && (
                    <button
                      type="button"
                      onClick={() => setIsPaletteOpen(true)}
                      className="text-xs font-medium text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-900 transition-colors"
                    >
                      {t("productPage.palette")}
                    </button>
                  )}
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

              {isAccessory ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-900">
                  {t("productPage.size")}
                </h3>
                <p className="mt-3 inline-flex rounded-2xl border border-accent bg-accent px-4 py-3 text-xs font-bold tracking-wider text-[#fff]">
                  {t("productPage.oneSize")}
                </p>
              </div>
              ) : (
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

                <div className="mb-4 inline-flex items-center rounded-full border border-stone-900/15 p-1">
                  <button
                    type="button"
                    onClick={() => handleSizeGroupChange("men")}
                    className={`rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                      sizeGroup === "men"
                        ? "bg-accent text-[#fff]"
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
                        ? "bg-accent text-[#fff]"
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
                            ? "border-accent bg-accent text-[#fff]"
                            : "border-stone-900/15 text-stone-700 hover:border-stone-900"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
              )}
            </div>

            {/* КНОПКИ ДЕЙСТВИЯ */}
            <div className="mt-12 flex gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                  className="flex-1 btn-ember rounded-2xl px-8 py-4 text-sm font-semibold uppercase tracking-widest duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                <LuShoppingBag size={18} /> {t("productPage.addToCart")}
              </button>

              {/* КНОПКА ИЗБРАННОГО */}
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 active:scale-95 shadow-sm ${
                  isFavorite
                    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-stone-900/15 text-stone-500 hover:border-stone-900 hover:text-stone-900"
                }`}
                title={isFavorite ? t("productPage.removeFromFavorites") : t("productPage.addToFavorites")}
              >
                {isFavorite ? (
                  <LuHeart size={22} className="fill-current text-red-500" />
                ) : (
                  <LuHeart size={22} />
                )}
              </button>
            </div>

            {isAccessory && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleAddToTailoring}
                  disabled={tailoringQty >= 5}
                  className="w-full rounded-2xl border border-stone-900 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-stone-900 transition-colors hover:bg-stone-900 hover:text-white disabled:opacity-40"
                >
                  {tailoringQty > 0
                    ? t("productPage.inTailoringOrder", { count: tailoringQty })
                    : t("productPage.addToTailoring")}
                </button>
                {tailoringQty > 0 && (
                  <Link
                    to="/individual-tailoring/step-1"
                    className="mt-3 inline-block text-xs font-semibold text-stone-500 underline underline-offset-4 hover:text-stone-900"
                  >
                    {t("productPage.openTailoring")}
                  </Link>
                )}
              </div>
            )}

            {/* ДЕТАЛИ И УХОД */}
            <div className="mt-12 border-t border-stone-200/60 divide-y divide-stone-200/60">
              <details className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold tracking-tight text-stone-900 marker:content-none select-none">
                  {t("productPage.processDescription")}
                  <LuChevronDown className="text-stone-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-sm font-medium text-stone-500 leading-relaxed pr-8">
                  {t("productPage.processText")}
                </div>
              </details>
              <details className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold tracking-tight text-stone-900 marker:content-none select-none">
                  {t("productPage.foreignCurrencyTitle")}
                  <LuChevronDown className="text-stone-400 group-open:rotate-180 transition-transform" />
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

      {!isAccessory && (
        <ColorPaletteModal
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
        />
      )}
    </div>
  );
};
