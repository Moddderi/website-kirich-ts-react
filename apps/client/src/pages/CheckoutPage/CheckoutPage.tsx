/* eslint-disable react-hooks/incompatible-library */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { clearCart } from "../../store/cartSlice";
import { IoIosArrowForward } from "react-icons/io";
import { FaTelegramPlane, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { createOrder } from "../../api/orderApi";

import { checkoutSchema } from "@project/shared";
import type { CheckoutFormValues, OrderPayload } from "@project/shared";

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = useAppSelector((state) => state.cart.items);
  const { type: tailoringType, measurements } = useAppSelector(
    (state) => state.tailoring,
  );

  const orderType: "ready-made" | "custom" = tailoringType
    ? "custom"
    : "ready-made";

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: "nova_poshta",
      paymentMethod: "online",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      city: "",
      warehouse: "",
      communicationMethod: "telegram",
      socialUsername: "",
    },
  });

  const deliveryMethod = watch("deliveryMethod");
  const communicationMethod = watch("communicationMethod");

  const getSocialNetworkLabel = () => {
    if (communicationMethod === "telegram") return "Telegram";
    if (communicationMethod === "instagram") return "Instagram";
    if (communicationMethod === "whatsapp") return "WhatsApp";
    return "";
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (orderType === "ready-made" && cartItems.length === 0) {
      alert("Ваша корзина пуста!");
      return;
    }

    if (orderType === "custom" && !tailoringType) {
      alert("Не вибрано тип виробу для пошиття!");
      navigate("/individual-tailoring");
      return;
    }

    setIsSubmitting(true);

    // Базова конструкція items (без жодних measurements всередині елементів)
    const itemsPayload =
      orderType === "ready-made"
        ? cartItems.map((item) => ({
            productId: item.productId ? String(item.productId) : null,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            color: item.options?.color || null,
            size: item.options?.size || null,
          }))
        : [
            {
              productId: null,
              name: `Індивідуальний пошив: ${tailoringType}`,
              quantity: 1,
              price: 0,
              color: null,
              size: null,
            },
          ];

    // Суворо типізований об'єкт відправки адаптований під Zod/Union схему
    let orderPayload: OrderPayload;

    if (orderType === "ready-made") {
      orderPayload = {
        ...data,
        totalAmount: totalPrice,
        status: "pending",
        orderType: "ready-made",
        items: itemsPayload,
      };
    } else {
      orderPayload = {
        ...data,
        totalAmount: 0,
        status: "pending",
        orderType: "custom",
        // 🟢 Виносимо мірки на рівень об'єкта замовлення, як того вимагає схема з packages/shared/src/order.schema.ts
        measurements: (measurements as Record<string, string>) || {},
        items: itemsPayload,
      };
    }

    try {
      const result = await createOrder(orderPayload);

      if (result.success) {
        if (orderType === "ready-made") {
          dispatch(clearCart());
        }

        const orderUuid = result.data?.id || result.orderId;

        if (orderUuid || orderType === "custom") {
          const successPath =
            orderType === "custom"
              ? "/individual-tailoring/order-success"
              : `/order-success/${orderUuid}`;
          navigate(successPath);
        } else {
          navigate("/");
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(
          "Network error details:",
          err.response?.data || err.message,
        );

        if (err.response?.data?.issues) {
          console.error("Zod validation issues:", err.response.data.issues);
        }

        alert(
          err.response?.data?.message || "Не вдалося з'єднатися з сервером.",
        );
      } else {
        const genericError = err as Error;
        console.error("Unexpected error:", genericError.message);
        alert("Сталася непередбачувана мережева помилка.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-24 animate-reveal-up">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16 mt-4"
      >
        {/* ЛЕВА КОЛОНКА — ЗБІР ДАНИХ */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="mb-8 border-b border-stone-200/60 pb-6 flex items-center justify-between">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-stone-900">
              {orderType === "custom"
                ? "Оформлення замовлення (Індивідуальний пошив)"
                : "Оформлення замовлення"}
            </h1>
            {orderType === "custom" && (
              <span className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-sm border border-stone-800">
                Індивідуальний пошив
              </span>
            )}
          </div>

          <div className="space-y-8">
            {/* Контактні дані */}
            <div className="bg-white p-6 sm:p-8 rounded-4xl border border-stone-200/60 shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-6">
                Контактні дані
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                    Ім'я
                  </label>
                  <input
                    type="text"
                    {...register("firstName")}
                    className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                      errors.firstName
                        ? "ring-red-500 focus:ring-red-500"
                        : "ring-stone-200 focus:ring-stone-900"
                    }`}
                    placeholder="Ваше ім'я"
                  />
                  {errors.firstName && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                    Прізвище
                  </label>
                  <input
                    type="text"
                    {...register("lastName")}
                    className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                      errors.lastName
                        ? "ring-red-500 focus:ring-red-500"
                        : "ring-stone-200 focus:ring-stone-900"
                    }`}
                    placeholder="Ваше прізвище"
                  />
                  {errors.lastName && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    {...register("phone")}
                    className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                      errors.phone
                        ? "ring-red-500 focus:ring-red-500"
                        : "ring-stone-200 focus:ring-stone-900"
                    }`}
                    placeholder="+380000000000"
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                      errors.email
                        ? "ring-red-500 focus:ring-red-500"
                        : "ring-stone-200 focus:ring-stone-900"
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Блок вибору каналу зв'язку */}
              <div className="mt-8 pt-6 border-t border-stone-100">
                <h3 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-4">
                  Куди вам написати?
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Менеджер зв'яжеться з вами у обраному месенджері для
                  підтвердження деталей.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      communicationMethod === "telegram"
                        ? "border-stone-900 bg-stone-50"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value="telegram"
                      {...register("communicationMethod")}
                      className="h-4 w-4 text-stone-900 accent-stone-900"
                    />
                    <FaTelegramPlane size={16} className="text-[#0088cc]" />
                    <span className="text-sm font-semibold text-stone-900">
                      Telegram
                    </span>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      communicationMethod === "instagram"
                        ? "border-stone-900 bg-stone-50"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value="instagram"
                      {...register("communicationMethod")}
                      className="h-4 w-4 text-stone-900 accent-stone-900"
                    />
                    <FaInstagram size={16} className="text-[#e1306c]" />
                    <span className="text-sm font-semibold text-stone-900">
                      Instagram
                    </span>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      communicationMethod === "whatsapp"
                        ? "border-stone-900 bg-stone-50"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value="whatsapp"
                      {...register("communicationMethod")}
                      className="h-4 w-4 text-stone-900 accent-stone-900"
                    />
                    <FaWhatsapp size={16} className="text-[#25d366]" />
                    <span className="text-sm font-semibold text-stone-900">
                      WhatsApp
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                    {communicationMethod === "whatsapp"
                      ? "Номер телефону у WhatsApp"
                      : `Нікнейм ${getSocialNetworkLabel()}`}
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    {communicationMethod !== "whatsapp" && (
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="text-sm font-semibold text-stone-400">
                          @
                        </span>
                      </div>
                    )}
                    <input
                      type="text"
                      {...register("socialUsername")}
                      className={`block w-full rounded-xl border-0 bg-white py-3.5 text-sm font-medium text-stone-900 ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                        communicationMethod !== "whatsapp"
                          ? "pl-9 pr-4"
                          : "px-4"
                      } ${
                        errors.socialUsername
                          ? "ring-red-500 focus:ring-red-500"
                          : "ring-stone-200 focus:ring-stone-900"
                      }`}
                      placeholder={
                        communicationMethod === "whatsapp"
                          ? "+380..."
                          : "username"
                      }
                    />
                  </div>
                  {errors.socialUsername && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.socialUsername.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Доставка */}
            <div className="bg-white p-6 sm:p-8 rounded-4xl border border-stone-200/60 shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-6">
                Доставка
              </h2>
              <div className="space-y-3 mb-6">
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === "nova_poshta"
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    value="nova_poshta"
                    {...register("deliveryMethod")}
                    className="h-4 w-4 text-stone-900 accent-stone-900"
                  />
                  <span className="text-sm font-semibold text-stone-900">
                    Нова Пошта
                  </span>
                </label>
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === "pickup"
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    value="pickup"
                    {...register("deliveryMethod")}
                    className="h-4 w-4 text-stone-900 accent-stone-900"
                  />
                  <span className="text-sm font-semibold text-stone-900">
                    Самовивіз із студії в Києві
                  </span>
                </label>
              </div>

              {deliveryMethod === "nova_poshta" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                      Місто
                    </label>
                    <input
                      type="text"
                      {...register("city")}
                      className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                        errors.city
                          ? "ring-red-500 focus:ring-red-500"
                          : "ring-stone-200 focus:ring-stone-900"
                      }`}
                      placeholder="Київ"
                    />
                    {errors.city && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                      Відділення
                    </label>
                    <input
                      type="text"
                      {...register("warehouse")}
                      className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                        errors.warehouse
                          ? "ring-red-500 focus:ring-red-500"
                          : "ring-stone-200 focus:ring-stone-900"
                      }`}
                      placeholder="№ відділення"
                    />
                    {errors.warehouse && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.warehouse.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ПРАВА КОЛОНКА — ПІДСУМОК ЗАМОВЛЕННЯ */}
        <div className="mt-12 lg:mt-0 lg:col-span-5 xl:col-span-4 relative">
          <div className="sticky top-32 space-y-6">
            <div className="p-6 sm:p-8 rounded-4xl bg-white border border-stone-200/60 shadow-sm">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-6">
                {orderType === "custom"
                  ? "Підсумок пошиття"
                  : "Ваше замовлення"}
              </h2>

              {orderType === "ready-made" && (
                <div className="space-y-4 pb-6 border-b border-stone-100">
                  <div className="flex justify-between text-sm font-medium text-stone-500">
                    <span>Товари ({totalQuantity})</span>
                    <span className="text-stone-900">
                      {totalPrice.toLocaleString()} ₴
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-stone-500">
                    <span>Доставка</span>
                    <span className="text-stone-900">
                      {deliveryMethod === "pickup"
                        ? "Безкоштовно"
                        : "За тарифами НП"}
                    </span>
                  </div>
                </div>
              )}

              {orderType === "custom" && (
                <div className="space-y-4 pb-6 border-b border-stone-100">
                  <div className="flex justify-between text-sm font-medium text-stone-500">
                    <span>Категорія:</span>
                    <span className="text-stone-900 font-semibold">
                      {tailoringType}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-stone-500">
                    <span>Тип замовлення:</span>
                    <span className="text-stone-900">Індивідуальний пошив</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-stone-500">
                    <span>Доставка:</span>
                    <span className="text-stone-900">
                      {deliveryMethod === "pickup"
                        ? "Самовивіз"
                        : "За тарифами НП"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end py-6">
                <span className="text-sm font-semibold uppercase tracking-widest text-stone-900">
                  Всього
                </span>
                <span className="text-2xl font-semibold text-stone-900 leading-none">
                  {orderType === "ready-made"
                    ? `${totalPrice.toLocaleString()} ₴`
                    : "Розраховується"}
                </span>
              </div>

              {orderType === "custom" && (
                <p className="text-xs text-stone-500 leading-relaxed mb-6">
                  Після підтвердження замовлення менеджер зв'яжеться з вами для
                  уточнення вартості пошиття за вашими мірками.
                </p>
              )}

              <button
                type="submit"
                disabled={
                  (orderType === "ready-made" && cartItems.length === 0) ||
                  isSubmitting
                }
                className="w-full rounded-2xl bg-stone-900 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white hover:bg-stone-800 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? "Обробка..." : "Підтвердити замовлення"}
                {!isSubmitting && (
                  <IoIosArrowForward
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
