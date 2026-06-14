import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { clearCart } from "../../store/cartSlice";
import { IoIosArrowForward } from "react-icons/io";
import { FaTelegramPlane, FaInstagram } from "react-icons/fa";

import { checkoutSchema } from "@project/shared";
import type { CheckoutFormValues } from "@project/shared";

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Получаем данные из корзины Redux
  const cartItems = useAppSelector((state) => state.cart.items);

  // Калькуляция количества товаров и общей суммы
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
      communicationMethod: "telegram", // Telegram по умолчанию
      socialUsername: "",
    },
  });

  // Отслеживаем методы для динамического UI
  const deliveryMethod = watch("deliveryMethod");
  const communicationMethod = watch("communicationMethod");

  // Обработчик отправки формы на бэкенд
  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      alert("Ваша корзина пуста!");
      return;
    }

    setIsSubmitting(true);

    // Формируем payload, полностью совместимый с обновленной моделью
    const orderPayload = {
      customer: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
      },
      delivery: {
        method: data.deliveryMethod,
        city: data.deliveryMethod === "nova_poshta" ? data.city : "Самовивіз",
        warehouse: data.deliveryMethod === "nova_poshta" ? data.warehouse : "-",
      },
      payment: data.paymentMethod,

      // Поля для связи менеджера с клиентом через соцсети
      communicationMethod: data.communicationMethod,
      socialUsername: data.socialUsername,

      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        color: item.options?.color || null,
        size: item.options?.size || null,
      })),
      totalAmount: totalPrice,
    };

    try {
      const response = await fetch("http://localhost:5005/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        dispatch(clearCart());

        const orderUuid = result.data?.id || result.orderId;

        if (!orderUuid) {
          console.error(
            "Бэкенд не вернул идентификатор заказа. Ответ сервера:",
            result,
          );
          alert(
            "Заказ создан, но не удалось получить его номер для отображения.",
          );
          navigate("/");
          return;
        }

        navigate(`/order-success/${orderUuid}`);
      } else {
        alert(result.message || "Сталася помилка при збереженні замовлення.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Не вдалося з'єднатися з сервером. Перевірте підключення.");
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
        {/* ЛЕВАЯ КОЛОНКА — ФОРМЫ СБОРА ДАННЫХ */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="mb-8 border-b border-stone-200/60 pb-6">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-stone-900">
              Оформлення замовлення
            </h1>
          </div>

          <div className="space-y-8">
            {/* Контактные данные */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-stone-200/60 shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-6">
                Контактні дані
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Имя */}
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

                {/* Прізвище */}
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

                {/* Телефон */}
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

                {/* Email */}
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

              {/* БЛОК ВЫБОРА КАНАЛА СВЯЗИ ДЛЯ МЕНЕДЖЕРА */}
              <div className="mt-8 pt-6 border-t border-stone-100">
                <h3 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-4">
                  Куди вам написати?
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Менеджер зв'яжеться з вами у обраній соцмережі для
                  підтвердження деталей замовлення.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
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
                </div>

                {/* Поле ввода никнейма (отображается всегда) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                    Нікнейм{" "}
                    {communicationMethod === "telegram"
                      ? "Telegram"
                      : "Instagram"}
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="text-sm font-semibold text-stone-400">
                        @
                      </span>
                    </div>
                    <input
                      type="text"
                      {...register("socialUsername")}
                      className={`block w-full rounded-xl border-0 bg-white py-3.5 pl-9 pr-4 text-sm font-medium text-stone-900 ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                        errors.socialUsername
                          ? "ring-red-500 focus:ring-red-500"
                          : "ring-stone-200 focus:ring-stone-900"
                      }`}
                      placeholder="username"
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
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-stone-200/60 shadow-sm">
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

              {/* Поля Новой Почты */}
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

        {/* ПРАВАЯ КОЛОНКА — ИТОГО ЗАКАЗА */}
        <div className="mt-12 lg:mt-0 lg:col-span-5 xl:col-span-4 relative">
          <div className="sticky top-32 space-y-6">
            <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-stone-200/60 shadow-sm">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-6">
                Ваше замовлення
              </h2>

              <div className="space-y-4 pb-6 border-b border-stone-100">
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>Товари ({totalQuantity})</span>
                  <span className="text-stone-900">
                    {totalPrice.toLocaleString()} ₴
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>Знижка</span>
                  <span className="text-stone-900">0 ₴</span>
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

              <div className="flex justify-between items-end py-6">
                <span className="text-sm font-semibold uppercase tracking-widest text-stone-900">
                  Всього
                </span>
                <span className="text-2xl font-semibold text-stone-900 leading-none">
                  {totalPrice.toLocaleString()} ₴
                </span>
              </div>

              <button
                type="submit"
                disabled={cartItems.length === 0 || isSubmitting}
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
