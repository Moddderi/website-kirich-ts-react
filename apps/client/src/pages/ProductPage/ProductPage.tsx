import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import type { Product } from "@project/shared";
import { SUBTYPE_LABELS } from "@project/shared";
import { Portal } from "../../components/shared/Portal/Portal";
import { useAppDispatch } from "../../store/store";
import { addToCart } from "../../store/cartSlice";

import { IoBagHandleOutline } from "react-icons/io5";
import { GrFavorite } from "react-icons/gr";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";

const AVAILABLE_COLORS = [
  { id: "black", hex: "#000000", label: "Черный" },
  { id: "burgundy", hex: "#8B0000", label: "Бордовый" },
  { id: "navy", hex: "#000080", label: "Тёмно-синий" },
];

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL"];

const fetchProductData = async (productId: string): Promise<Product> => {
  const res = await fetch(`http://localhost:5005/api/products/${productId}`);
  if (!res.ok) throw new Error("Товар не найден");
  return res.json();
};

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Инициализируем Redux-диспетчер строго НА САМОМ ВЕРХУ компонента
  const dispatch = useAppDispatch();

  // Локальный стейт
  const [selectedColor, setSelectedColor] = useState<string>("black");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);

  // Запрос данных
  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product, Error>({
    queryKey: ["productFull", id],
    queryFn: () => fetchProductData(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });

  // ОБРАБОТЧИК КЛИКА «ДОБАВИТЬ В КОРЗИНУ»
  const handleAddToCart = () => {
    if (!product) return;

    const colorObj = AVAILABLE_COLORS.find((c) => c.id === selectedColor);
    const colorLabel = colorObj ? colorObj.label : selectedColor;

    dispatch(
      addToCart({
        productId: product.id.toString(), // Приводим number к string, фиксируя ошибку TS2322
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl ?? "",
        productCode: product.product_code,
        options: {
          color: colorLabel,
          size: selectedSize,
        },
      }),
    );

    navigate("/cart");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-stone-500 font-medium text-sm">
        <span className="animate-pulse">Загрузка информации о товаре...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold text-stone-900 mb-2">
          Произошла ошибка
        </h2>
        <p className="text-stone-500 text-sm mb-6">
          {error?.message || "Товар не существует."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16 animate-reveal-up">
      <div className="mb-8">
        <Breadcrumbs />
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        {/* ЛЕВАЯ ЧАСТЬ — ГАЛЕРЕЯ */}
        <div className="lg:col-span-7 flex flex-col gap-4 relative">
          <div className="aspect-3/4 w-full overflow-hidden rounded-[2.5rem] bg-stone-200 border border-stone-200/60 relative group">
            <div className="absolute inset-0 bg-stone-300 transition-transform duration-1000 group-hover:scale-105">
              <div className="w-full h-full bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-size-[2rem_2rem] mix-blend-multiply opacity-50"></div>
              <img
                className="w-full h-full absolute inset-0 object-cover"
                src={product.imageUrl ?? ""}
                alt={product.name}
              />
            </div>
          </div>
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
                  2-3 дні
                </span>
                {product.product_code && (
                  <span className="text-[10px] font-medium text-stone-400 tracking-wider ml-auto">
                    Арт: {product.product_code}
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-stone-900 mb-4">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold text-stone-900 mb-6">
                от {Number(product.price).toLocaleString()} ₴
              </p>
              <p className="text-sm font-medium text-stone-500 leading-relaxed">
                Описание товара...
              </p>
            </div>

            <div className="space-y-10 border-t border-stone-200/60 pt-10">
              {/* МАТЕРИАЛ ОСНОВЫ */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-900">
                    Материал основы
                  </h3>
                  <button className="text-xs font-medium text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-900 transition-colors">
                    Палитра
                  </button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {AVAILABLE_COLORS.map((color) => {
                    const isColorSelected = selectedColor === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color.id)}
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
                          className="w-10 h-10 rounded-full shadow-sm group-hover:scale-95 transition-transform"
                          style={{ backgroundColor: color.hex }}
                        ></span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ВЫБОР РАЗМЕРА */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-900">
                    Размер
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-xs font-medium text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-900 transition-colors"
                  >
                    Размерная сетка
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {AVAILABLE_SIZES.map((size) => {
                    const isSizeSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-14 h-12 rounded-2xl border text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center px-3 active:scale-95 ${
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
                <IoBagHandleOutline size={18} /> Добавить в корзину
              </button>
              <button
                type="button"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-400 hover:text-stone-900 hover:border-stone-900 transition-all duration-300 active:scale-95 shadow-sm"
              >
                <GrFavorite size={20} />
              </button>
            </div>

            {/* ДЕТАЛИ И УХОД */}
            <div className="mt-12 border-t border-stone-200/60 divide-y divide-stone-200/60">
              <details className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold tracking-tight text-stone-900 marker:content-none select-none">
                  Описание процесса
                  <IoIosArrowDown className="text-stone-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-sm font-medium text-stone-500 leading-relaxed pr-8">
                  После оформления заказа мы свяжемся с вами для уточнения
                  деталей. Пошив занимает 10-14 дней.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО: РАЗМЕРНАЯ СЕТКА */}
      {isSizeChartOpen && (
        <Portal>
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
            <div
              className="absolute inset-0"
              onClick={() => setIsSizeChartOpen(false)}
            />

            <div className="relative bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-10 shadow-2xl border border-stone-100 max-h-[90vh] overflow-y-auto animate-reveal-up z-10">
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                <IoMdClose size={22} />
              </button>

              <h3 className="text-2xl font-semibold tracking-tight text-stone-900 mb-6">
                Таблица размеров
              </h3>

              <div className="overflow-x-auto min-w-full inline-block align-middle">
                <table className="w-full text-left text-sm text-stone-600 border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs font-semibold uppercase tracking-widest text-stone-400">
                      <th className="py-3 px-2">Размер</th>
                      <th className="py-3 px-2">Обхват груди (см)</th>
                      <th className="py-3 px-2">Обхват талии (см)</th>
                      <th className="py-3 px-2">Обхват бедер (см)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {[
                      {
                        size: "XS",
                        chest: "80-84",
                        waist: "60-64",
                        hips: "86-90",
                      },
                      {
                        size: "S",
                        chest: "84-88",
                        waist: "64-68",
                        hips: "90-94",
                      },
                      {
                        size: "M",
                        chest: "88-92",
                        waist: "68-72",
                        hips: "94-98",
                      },
                      {
                        size: "L",
                        chest: "92-96",
                        waist: "72-76",
                        hips: "98-102",
                      },
                      {
                        size: "XL",
                        chest: "96-100",
                        waist: "76-80",
                        hips: "102-106",
                      },
                    ].map((row) => (
                      <tr
                        key={row.size}
                        className={
                          selectedSize === row.size
                            ? "bg-stone-50 font-semibold text-stone-900"
                            : ""
                        }
                      >
                        <td className="py-3.5 px-2 text-stone-900 font-bold">
                          {row.size}
                        </td>
                        <td className="py-3.5 px-2">{row.chest}</td>
                        <td className="py-3.5 px-2">{row.waist}</td>
                        <td className="py-3.5 px-2">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-6 text-xs text-stone-400 leading-relaxed">
                * Если ваши параметры находятся между двумя размерами,
                рекомендуем выбирать больший размер или проконсультироваться с
                менеджером при подтверждении заказа.
              </p>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};
