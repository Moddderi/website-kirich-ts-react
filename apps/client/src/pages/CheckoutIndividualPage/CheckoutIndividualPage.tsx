/* eslint-disable react-hooks/incompatible-library */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../store/store";
import { IoIosArrowForward } from "react-icons/io";
import { FaTelegramPlane, FaInstagram, FaWhatsapp } from "react-icons/fa";

// Импортируем общую схему валидации и тип из shared
import { checkoutSchema } from "@project/shared";
import type { CheckoutFormValues } from "@project/shared";

// Импортируем функцию создания заказа из вашего API
import { createOrder } from "../../api/orderApi";

export const CheckoutIndividualPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Достаем из глобального стейта выбранный тип пошива и заполненные мерки
  const { type, measurements } = useSelector(
    (state: RootState) => state.tailoring,
  );

  // Настройка формы оформления заказа с общей схемой Zod
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

  // Отслеживаем методы для динамического UI
  const deliveryMethod = watch("deliveryMethod");
  const communicationMethod = watch("communicationMethod");

  // Если тип изделия не был заполнен, перенаправляем на начало
  if (!type) {
    navigate("/individual-tailoring");
    return null;
  }

  // Получаем красивое название выбранного мессенджера для подсказки
  const getSocialNetworkLabel = () => {
    if (communicationMethod === "telegram") return "Telegram";
    if (communicationMethod === "instagram") return "Instagram";
    if (communicationMethod === "whatsapp") return "WhatsApp";
    return "";
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);

    // Формируем финальный объект заказа строго под модель БД и Zod-схему (custom)
    const orderPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email || "",
      deliveryMethod: data.deliveryMethod,
      city: data.city || undefined,
      warehouse: data.warehouse || undefined,
      paymentMethod: data.paymentMethod,
      communicationMethod: data.communicationMethod || "telegram",
      socialUsername: data.socialUsername || "",
      totalAmount: 0,
      status: "pending",
      orderType: "custom" as const,
      measurements: measurements || {},
    };

    try {
      // Отправляем на бэкенд
      const result = await createOrder(orderPayload);

      if (result) {
        navigate("/individual-tailoring/success");
      }
    } catch (error) {
      console.error("Ошибка при оформлении заказа:", error);
      alert("Не вдалося оформити замовлення. Спробуйте ще раз.");
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
        {/* Левая колонка — поля ввода покупателя */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <div className="mb-8 border-b border-stone-200/60 pb-6">
            <span className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-sm border border-stone-800 mb-4 inline-block">
              Шаг 3 из 3
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-stone-900 leading-tight">
              Оформлення замовлення (Індивідуальний пошив)
            </h1>
            <p className="text-base font-medium text-stone-500 mt-2 leading-relaxed">
              Заповніть ваші контактні дані, щоб наші менеджери могли зв'язатися
              з вами для підтвердження деталей.
            </p>
          </div>

          <div className="space-y-8">
            {/* Контактные данные */}
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
                    placeholder="Іван"
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
                    placeholder="Іванов"
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
                    Email (необов'язково)
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset ring-stone-200 transition-all placeholder:text-stone-400 focus:ring-2 focus:ring-stone-900"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* БЛОК ВЫБОРА КАНАЛА СВЯЗИ ДЛЯ МЕНЕДЖЕРА */}
              <div className="mt-8 pt-6 border-t border-stone-100">
                <h3 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-4">
                  Куди вам написати?
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Менеджер зв'яжеться з вами у обраному месенджері для
                  підтвердження деталей пошиття.
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

                {/* Поле ввода юзернейма/телефона */}
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

        {/* Правая колонка — подтверждение пошива */}
        <div className="mt-12 lg:mt-0 lg:col-span-5 xl:col-span-4 relative">
          <div className="sticky top-32 space-y-6">
            <div className="p-6 sm:p-8 rounded-4xl bg-white border border-stone-200/60 shadow-sm">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-6">
                Підсумок пошиття
              </h2>

              <div className="space-y-4 pb-6 border-b border-stone-100">
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>Категорія:</span>
                  <span className="text-stone-900 font-semibold">{type}</span>
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

              <div className="py-6">
                <p className="text-xs text-stone-500 leading-relaxed mb-6">
                  Ціна розраховується менеджером після уточнення всіх деталей за
                  вашими мірками.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-stone-900 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white hover:bg-stone-800 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
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
        </div>
      </form>
    </div>
  );
};
