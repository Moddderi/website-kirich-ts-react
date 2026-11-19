/* eslint-disable react-hooks/incompatible-library */
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { clearCart } from "../../store/cartSlice";
import { clearTailoring } from "../../store/tailoringSlice";
import { createOrder } from "../../api/orderApi";
import { useCartMoney } from "../../hooks/useFormattedPrice";
import { useReadyAccessories } from "../../hooks/useReadyAccessories";
import { useProductName } from "../../utils/useLocalizedProduct";
import { accessorySizeLabel } from "../../utils/accessorySizeLabel";
import {
  useFormatDate,
  useScheduleFormat,
  useTailoringEstimate,
} from "../../hooks/useTailoringEstimate";

import { saveCabinetToken } from "../../utils/cabinetStorage";
import {
  PREPAYMENT_RATE,
  prepaymentWithReadyAccessories,
  checkoutSchema,
  formatPrice,
  isFarOrder,
  isRedemptionCertificateCode,
  normalizeRedemptionCertificateCode,
} from "@project/shared";
import { useCertificateDiscount } from "../../hooks/useCertificateDiscount";
import type { CheckoutFormValues, OrderPayload } from "@project/shared";
import {
  NovaPoshtaIcon,
  UkrposhtaIcon,
} from "../../components/DeliveryIcons/DeliveryIcons";
import { FaInstagram, FaTelegram, FaViber, FaWhatsapp } from "react-icons/fa6";
import { LuChevronRight } from "react-icons/lu";
import { ReferencePhotoUpload } from "../../components/ReferencePhotoUpload/ReferencePhotoUpload";
import { SiSignal } from "react-icons/si";

const PHONE_CONTACT_METHODS = new Set([
  "whatsapp",
  "viber",
  "signal",
] as const);

const CHECKOUT_MESSENGERS = [
  { value: "telegram", label: "Telegram", Icon: FaTelegram, color: "#2AABEE" },
  { value: "instagram", label: "Instagram", Icon: FaInstagram, color: "url(#checkout-ig)" },
  { value: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp, color: "#25D366" },
  { value: "viber", label: "Viber", Icon: FaViber, color: "#7360F2" },
  { value: "signal", label: "Signal", Icon: SiSignal, color: "#3A76F0" },
] as const;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { formatTotal, formatLine } = useCartMoney();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  // After a successful order we clear Redux; don't bounce the user back to step 1.
  const [orderPlaced, setOrderPlaced] = useState(false);

  const cartItems = useAppSelector((state) => state.cart.items);
  const displayCurrency = useAppSelector((state) => state.currency.code);
  const {
    types: tailoringTypes,
    lines: tailoringLines,
    browseCategory: tailoringBrowseCategory,
    browseProgram: tailoringBrowseProgram,
    quantities: tailoringQuantities,
    programs: tailoringPrograms,
    measurements,
    measurementUnit,
  } = useAppSelector((state) => state.tailoring);
  const formatDate = useFormatDate();
  const schedule = useScheduleFormat();
  const { estimate, formatRange } = useTailoringEstimate();
  const { selected: readySelected, totalDisplay: accessoriesTotal } =
    useReadyAccessories();
  const getProductName = useProductName();

  // Cart checkout is /checkout; custom flow is /individual-tailoring/checkout.
  // Do not infer from leftover Redux tailoring state — that caused cart → custom bug.
  const orderType: "ready-made" | "custom" = location.pathname.includes(
    "/individual-tailoring",
  )
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
      comment: "",
      certificateCode: "",
    },
  });

  const deliveryMethod = watch("deliveryMethod");
  const communicationMethod = watch("communicationMethod");
  const certificateCode = watch("certificateCode");

  const orderGrossUah =
    orderType === "ready-made"
      ? totalPrice
      : estimate.priceFrom + accessoriesTotal;

  const cert = useCertificateDiscount(certificateCode, orderGrossUah);
  const certificateTrimmed = certificateCode?.trim() ?? "";
  const certificateEntered =
    certificateTrimmed.length > 0 &&
    isRedemptionCertificateCode(certificateTrimmed);

  const netOrderUah = Math.max(
    0,
    orderGrossUah - (cert.valid ? cert.discountUah : 0),
  );
  const fullyCoveredByCertificate = cert.valid && netOrderUah === 0;
  const certificateDiscountUah = cert.valid ? cert.discountUah : 0;

  const roundTo10 = (value: number) => Math.round(value / 10) * 10;

  /** 30% of tailoring after cert + accessories at 100% (discount hits accessories first). */
  const tailoringPrepaymentAfterCertificate = () => {
    const discOnAcc = Math.min(certificateDiscountUah, accessoriesTotal);
    const netAcc = accessoriesTotal - discOnAcc;
    const discOnTailor = Math.max(0, certificateDiscountUah - accessoriesTotal);
    const netTailorFrom = Math.max(0, estimate.priceFrom - discOnTailor);
    const netTailorTo = Math.max(0, estimate.priceTo - discOnTailor);
    return {
      from: roundTo10(netTailorFrom * PREPAYMENT_RATE) + netAcc,
      to: roundTo10(netTailorTo * PREPAYMENT_RATE) + netAcc,
    };
  };

  const prepaymentDisplay =
    certificateDiscountUah > 0
      ? tailoringPrepaymentAfterCertificate()
      : prepaymentWithReadyAccessories(estimate, accessoriesTotal);

  const getSocialNetworkLabel = () => {
    const found = CHECKOUT_MESSENGERS.find((m) => m.value === communicationMethod);
    return found?.label ?? "";
  };

  const usesPhoneContact = PHONE_CONTACT_METHODS.has(
    communicationMethod as "whatsapp" | "viber" | "signal",
  );

  const contactFieldLabel = () => {
    if (communicationMethod === "whatsapp") return t("checkout.whatsappPhone");
    if (communicationMethod === "viber") return t("checkout.viberPhone");
    if (communicationMethod === "signal") return t("checkout.signalPhone");
    return t("checkout.nickname", { network: getSocialNetworkLabel() });
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (orderType === "ready-made" && cartItems.length === 0) {
      alert(t("checkout.emptyCart"));
      return;
    }

    if (orderType === "custom" && tailoringTypes.length === 0) {
      alert(t("checkout.noTailoringType"));
      navigate("/individual-tailoring/step-1");
      return;
    }

    if (certificateEntered && !cert.valid) {
      alert(cert.message ?? t("checkout.certificateInvalid"));
      return;
    }

    setIsSubmitting(true);

    const certificatePayload =
      certificateEntered && cert.valid
        ? normalizeRedemptionCertificateCode(certificateTrimmed)
        : undefined;

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
        : // Prices are recomputed on the server from tailoringTypes.
          tailoringTypes.map((type) => ({
            productId: null,
            name: `Індивідуальний пошив: ${type}`,
            quantity: 1,
            price: 0,
            color: null,
            size: null,
          }));

    // Суворо типізований об'єкт відправки адаптований під Zod/Union схему
    let orderPayload: OrderPayload;

    if (orderType === "ready-made") {
      orderPayload = {
        ...data,
        totalAmount: Math.max(0, totalPrice - cert.discountUah),
        status: "pending",
        orderType: "ready-made",
        displayCurrency,
        certificateCode: certificatePayload,
        items: itemsPayload,
      };
    } else {
      orderPayload = {
        ...data,
        totalAmount: 0,
        status: "pending",
        orderType: "custom",
        displayCurrency,
        tailoringTypes,
        tailoringQuantities: Object.fromEntries(
          tailoringTypes.map((type) => [type, tailoringQuantities[type] ?? 1]),
        ),
        preferredStartDate: estimate.startDate ?? undefined,
        tailoringPrograms: Object.fromEntries(
          tailoringTypes.map((type) => [type, tailoringPrograms[type] ?? "ST"]),
        ),
        tailoringCategory: tailoringBrowseCategory ?? undefined,
        tailoringOrderProgram: tailoringBrowseProgram ?? undefined,
        tailoringLines: tailoringLines.length > 0 ? tailoringLines : undefined,
        readyAccessories:
          readySelected.length > 0
            ? readySelected.map((line) => ({
                productId: line.productId,
                quantity: line.quantity,
                ...(line.size ? { size: line.size } : {}),
              }))
            : undefined,
        certificateCode: certificatePayload,
        // 🟢 Виносимо мірки на рівень об'єкта замовлення, як того вимагає схема з packages/shared/src/order.schema.ts
        measurements: {
          unit: measurementUnit,
          values: measurements,
        },
        items: itemsPayload,
        ...(referenceImageUrls.length > 0
          ? { referenceImageUrls }
          : undefined),
      };
    }

    try {
      const result = await createOrder(orderPayload);

      if (result.success) {
        if (orderType === "ready-made") {
          dispatch(clearCart());
        } else {
          setOrderPlaced(true);
          dispatch(clearTailoring());
        }

        const orderUuid = result.data?.id || result.orderId;

        if (orderUuid || orderType === "custom") {
          const successPath =
            orderType === "custom"
              ? "/individual-tailoring/order-success"
              : `/order-success/${orderUuid}`;
          saveCabinetToken(result.accessToken);
          navigate(successPath, {
            state: {
              accessToken: result.accessToken ?? null,
              certificate:
                certificateEntered && cert.valid
                  ? {
                      code: certificatePayload ?? certificateTrimmed,
                      discountUah: cert.discountUah,
                    }
                  : null,
            },
          });
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
          err.response?.data?.message || t("checkout.serverError"),
        );
      } else {
        const genericError = err as Error;
        console.error("Unexpected error:", genericError.message);
        alert(t("checkout.unexpectedError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderType === "custom" && !orderPlaced) {
    if (tailoringTypes.length === 0) {
      return <Navigate to="/individual-tailoring/step-1" replace />;
    }
    if (Object.keys(measurements).length === 0 && !isFarOrder(estimate.startDate)) {
      return <Navigate to="/individual-tailoring/step-3" replace />;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-24 animate-reveal-up">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16 mt-2 sm:mt-4"
      >
        {/* ЛЕВА КОЛОНКА — ЗБІР ДАНИХ */}
        <div className="min-w-0 lg:col-span-7 xl:col-span-8">
          <div className="mb-6 sm:mb-8 border-b border-stone-200/60 pb-5 sm:pb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tighter text-stone-900 leading-tight">
              {orderType === "custom"
                ? t("checkout.titleCustom")
                : t("checkout.titleReady")}
            </h1>
            {orderType === "custom" && (
              <span className="self-start rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent shrink-0">
                {t("checkout.customBadge")}
              </span>
            )}
          </div>

          <div className="space-y-8">
            {/* Контактні дані */}
            <div className="bg-white p-6 sm:p-8 rounded-4xl border border-stone-200/60 shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-6">
                {t("checkout.contactData")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                    {t("checkout.firstName")}
                  </label>
                  <input
                    type="text"
                    {...register("firstName")}
                    className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                      errors.firstName
                        ? "ring-red-500 focus:ring-red-500"
                        : "ring-stone-200 focus:ring-accent/70"
                    }`}
                    placeholder={t("checkout.firstNamePlaceholder")}
                  />
                  {errors.firstName && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                    {t("checkout.lastName")}
                  </label>
                  <input
                    type="text"
                    {...register("lastName")}
                    className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                      errors.lastName
                        ? "ring-red-500 focus:ring-red-500"
                        : "ring-stone-200 focus:ring-accent/70"
                    }`}
                    placeholder={t("checkout.lastNamePlaceholder")}
                  />
                  {errors.lastName && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                    {t("checkout.phone")}
                  </label>
                  <input
                    type="tel"
                    {...register("phone")}
                    className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                      errors.phone
                        ? "ring-red-500 focus:ring-red-500"
                        : "ring-stone-200 focus:ring-accent/70"
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
                    {t("checkout.email")}
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                      errors.email
                        ? "ring-red-500 focus:ring-red-500"
                        : "ring-stone-200 focus:ring-accent/70"
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                  <p className="mt-2 text-xs font-medium leading-relaxed text-stone-500">
                    {t("checkout.emailNote")}
                  </p>
                </div>
              </div>

              {/* Блок вибору каналу зв'язку */}
              <div className="mt-8 pt-6 border-t border-stone-100">
                <h3 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-4">
                  {t("checkout.whereToWrite")}
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  {t("checkout.messengerNote")}
                </p>

                <svg width="0" height="0" className="absolute" aria-hidden>
                  <defs>
                    <linearGradient id="checkout-ig" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fccc63" />
                      <stop offset="35%" stopColor="#f77737" />
                      <stop offset="65%" stopColor="#e1306c" />
                      <stop offset="100%" stopColor="#833ab4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div
                  className="relative mb-5 flex flex-wrap gap-2.5"
                  role="radiogroup"
                  aria-label={t("checkout.whereToWrite")}
                >
                  {CHECKOUT_MESSENGERS.map(({ value, label, Icon, color }) => (
                    <label
                      key={value}
                      className={`inline-flex min-h-12 min-w-[calc(50%-0.3125rem)] flex-1 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 transition-all sm:min-w-[10.25rem] sm:flex-none md:min-w-[11rem] ${
                        communicationMethod === value
                          ? "border-accent bg-accent/10"
                          : "border-stone-200 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        value={value}
                        {...register("communicationMethod")}
                        className="h-4 w-4 shrink-0 text-stone-900 accent-stone-900"
                      />
                      <Icon
                        size={16}
                        className="shrink-0"
                        style={{ color, fill: color }}
                        aria-hidden
                      />
                      <span className="truncate text-sm font-semibold text-stone-900">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                    {contactFieldLabel()}
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    {!usesPhoneContact && (
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
                        !usesPhoneContact ? "pl-9 pr-4" : "px-4"
                      } ${
                        errors.socialUsername
                          ? "ring-red-500 focus:ring-red-500"
                          : "ring-stone-200 focus:ring-accent/70"
                      }`}
                      placeholder={usesPhoneContact ? "+380..." : "username"}
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
                {t("checkout.delivery")}
              </h2>
              <div className="space-y-3 mb-6">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === "nova_poshta"
                      ? "border-accent bg-accent/10"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    value="nova_poshta"
                    {...register("deliveryMethod")}
                    className="h-4 w-4 text-stone-900 accent-stone-900"
                  />
                  <NovaPoshtaIcon size={24} className="text-[#ED1C24] shrink-0" />
                  <span className="text-sm font-semibold text-stone-900">
                    {t("checkout.novaPoshta")}
                  </span>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === "ukrposhta"
                      ? "border-accent bg-accent/10"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    value="ukrposhta"
                    {...register("deliveryMethod")}
                    className="h-4 w-4 text-stone-900 accent-stone-900"
                  />
                  <UkrposhtaIcon size={22} className="text-[#E6B800] shrink-0" />
                  <span className="text-sm font-semibold text-stone-900">
                    {t("checkout.ukrposhta")}
                  </span>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === "pickup"
                      ? "border-accent bg-accent/10"
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
                    {t("checkout.pickup")}
                  </span>
                </label>
              </div>

              {(deliveryMethod === "nova_poshta" ||
                deliveryMethod === "ukrposhta") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                      {t("checkout.city")}
                    </label>
                    <input
                      type="text"
                      {...register("city")}
                      className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                        errors.city
                          ? "ring-red-500 focus:ring-red-500"
                          : "ring-stone-200 focus:ring-accent/70"
                      }`}
                      placeholder={t("checkout.cityPlaceholder")}
                    />
                    {errors.city && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900 mb-2.5">
                      {t("checkout.warehouse")}
                    </label>
                    <input
                      type="text"
                      {...register("warehouse")}
                      className={`block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                        errors.warehouse
                          ? "ring-red-500 focus:ring-red-500"
                          : "ring-stone-200 focus:ring-accent/70"
                      }`}
                      placeholder={t("checkout.warehousePlaceholder")}
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

            {orderType === "custom" && (
              <div className="bg-white p-6 sm:p-8 rounded-4xl border border-stone-200/60 shadow-sm">
                <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-1">
                  {t("checkout.comment")}
                </h2>
                <p className="text-xs font-medium text-stone-400 mb-5">
                  {t("checkout.commentOptional")}
                </p>
                <textarea
                  rows={4}
                  maxLength={1000}
                  {...register("comment")}
                  placeholder={t("checkout.commentPlaceholder")}
                  className={`block w-full resize-y rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                    errors.comment
                      ? "ring-red-500 focus:ring-red-500"
                      : "ring-stone-200 focus:ring-accent/70"
                  }`}
                />
                {errors.comment && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.comment.message}
                  </p>
                )}
                <ReferencePhotoUpload
                  urls={referenceImageUrls}
                  onChange={setReferenceImageUrls}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
        </div>

        {/* ПРАВА КОЛОНКА — ПІДСУМОК ЗАМОВЛЕННЯ */}
        <div className="mt-8 sm:mt-12 lg:mt-0 min-w-0 lg:col-span-5 xl:col-span-4 relative">
          <div className="lg:sticky lg:top-32 space-y-6">
            <div className="p-6 sm:p-8 rounded-4xl bg-white border border-stone-200/60 shadow-sm">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-6">
                {orderType === "custom"
                  ? t("checkout.tailoringSummary")
                  : t("checkout.orderSummary")}
              </h2>

              {orderType === "ready-made" && (
                <div className="space-y-4 pb-6 border-b border-stone-100">
                  <div className="flex justify-between text-sm font-medium text-stone-500">
                    <span>{t("checkout.products", { count: totalQuantity })}</span>
                    <span className="text-stone-900">
                      {formatTotal(cartItems)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-stone-500">
                    <span>{t("checkout.deliveryLabel")}</span>
                    <span className="text-stone-900">
                      {deliveryMethod === "pickup"
                        ? t("checkout.free")
                        : t("checkout.byNPTariffs")}
                    </span>
                  </div>
                </div>
              )}

              {orderType === "custom" && (
                <div className="space-y-3 sm:space-y-4 pb-6 border-b border-stone-100">
                  {estimate.items.map((item, index) => (
                    <div
                      key={item.productId ?? `${item.type}-${index}`}
                      className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 text-sm font-medium text-stone-500"
                    >
                      <span className="text-stone-900 font-semibold">
                        {item.productId
                          ? t(`selectType.catalog.${item.productId}`, {
                              defaultValue: item.productId,
                            })
                          : t(`measurementConfig.${item.type}`)}
                      </span>
                      <span className="text-stone-900 sm:text-right">
                        {formatRange(item.priceFrom, item.priceTo)}
                      </span>
                    </div>
                  ))}
                  {readySelected.map((line) => (
                    <div
                      key={`acc-${line.productId}-${line.size ?? ""}`}
                      className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 text-sm font-medium text-stone-500"
                    >
                      <span className="text-stone-900 font-semibold">
                        {getProductName(line.product)}
                        {line.size ? `, ${accessorySizeLabel(line.size, t)}` : ""}
                        {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                      </span>
                      <span className="text-stone-900 sm:text-right">
                        {formatLine(line.priceUah, line.quantity)}
                      </span>
                    </div>
                  ))}
                  {Object.keys(measurements).length > 0 ? (
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 text-sm font-medium text-stone-500">
                      <span>{t("checkout.measurementUnits")}:</span>
                      <span className="text-stone-900 font-semibold sm:text-right">
                        {t(`measurementUnits.${measurementUnit}`)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs font-medium leading-relaxed text-stone-500">
                      {t("checkout.measurementsLater")}
                    </p>
                  )}
                  {Object.entries(measurements)
                    .filter(([key]) => key !== "waist_definition")
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 text-xs font-medium text-stone-500"
                      >
                        <span className="min-w-0 wrap-break-word">
                          {t(`measurementNames.${key}`, { defaultValue: key })}
                          :
                        </span>
                        <span className="text-stone-900 sm:text-right sm:whitespace-nowrap shrink-0">
                          {value} {t(`measurementUnits.${measurementUnit}`)}
                        </span>
                      </div>
                    ))}
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 text-sm font-medium text-stone-500">
                    <span>{t("checkout.orderType")}:</span>
                    <span className="text-stone-900 sm:text-right">
                      {t("checkout.orderTypeCustom")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 text-sm font-medium text-stone-500">
                    <span>{t("checkout.deliveryLabel")}:</span>
                    <span className="text-stone-900 sm:text-right">
                      {deliveryMethod === "pickup"
                        ? t("checkout.selfPickup")
                        : t("checkout.byNPTariffs")}
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-6 space-y-3 border-b border-stone-100 pb-6">
                <label className="block text-xs font-semibold uppercase tracking-widest text-stone-900">
                  {t("checkout.certificateLabel")}
                </label>
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={t("checkout.certificatePlaceholder")}
                  {...register("certificateCode")}
                  className={`block w-full rounded-xl border-0 bg-white py-3 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
                    errors.certificateCode
                      ? "ring-red-500 focus:ring-red-500"
                      : certificateEntered && !cert.loading && !cert.valid
                        ? "ring-red-400 focus:ring-red-400"
                        : certificateEntered && cert.valid
                          ? "ring-emerald-500/60 focus:ring-emerald-500/60"
                          : "ring-stone-200 focus:ring-accent/70"
                  }`}
                />
                {errors.certificateCode && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.certificateCode.message}
                  </p>
                )}
                {certificateEntered && cert.loading && (
                  <p className="text-xs text-stone-500">
                    {t("checkout.certificateChecking")}
                  </p>
                )}
                {certificateEntered && !cert.loading && cert.message && (
                  <p className="text-xs font-medium text-red-500">
                    {cert.message}
                  </p>
                )}
                {certificateEntered && cert.valid && (
                  <p className="text-xs font-medium text-emerald-700">
                    {t("checkout.certificateApplied", {
                      amount: formatPrice(cert.discountUah, "UAH"),
                    })}
                  </p>
                )}
                <p className="text-xs leading-relaxed text-stone-500">
                  {t("checkout.certificateHint")}
                </p>
              </div>

              {cert.valid && cert.discountUah > 0 && (
                <div className="flex justify-between text-sm font-medium text-stone-500 pb-4">
                  <span>{t("checkout.certificateDiscount")}</span>
                  <span className="text-emerald-700">
                    −{formatPrice(cert.discountUah, "UAH")}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-end justify-between gap-3 py-6">
                <span className="text-sm font-semibold uppercase tracking-widest text-stone-900">
                  {t("checkout.total")}
                </span>
                <span className="text-2xl font-semibold text-stone-900 leading-none">
                  {orderType === "ready-made" ? (
                    formatPrice(
                      Math.max(0, totalPrice - cert.discountUah),
                      displayCurrency,
                    )
                  ) : (
                    formatRange(
                      Math.max(0, estimate.priceFrom + accessoriesTotal - cert.discountUah),
                      Math.max(0, estimate.priceTo + accessoriesTotal - cert.discountUah),
                    )
                  )}
                </span>
              </div>

              {fullyCoveredByCertificate && (
                <div className="mb-6 rounded-2xl border border-emerald-200/80 bg-emerald-50 px-5 py-4 text-left dark:border-emerald-500/30 dark:bg-emerald-950/40">
                  <p className="text-sm font-semibold text-emerald-900">
                    {t("checkout.certificateFullCoverTitle")}
                  </p>
                  <p className="mt-2 text-xs font-medium leading-relaxed text-emerald-800">
                    {t("checkout.certificateFullCoverDesc")}
                  </p>
                </div>
              )}

              {orderType === "custom" && (
                <div className="mb-6 space-y-3">
                  <div
                    className={`flex flex-wrap justify-between gap-2 rounded-2xl px-5 py-4 ${
                      fullyCoveredByCertificate
                        ? "border border-emerald-200/80 bg-emerald-50 text-emerald-900"
                        : "palette-original bg-stone-900 text-white"
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold uppercase tracking-widest ${
                        fullyCoveredByCertificate ? "text-emerald-800" : "text-stone-300"
                      }`}
                    >
                      {t("checkout.prepaymentLine", {
                        percent: Math.round(PREPAYMENT_RATE * 100),
                      })}
                    </span>
                    <span className="text-sm font-semibold">
                      {fullyCoveredByCertificate
                        ? t("checkout.certificateNoPrepayment")
                        : formatRange(
                            prepaymentDisplay.from,
                            prepaymentDisplay.to,
                          )}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-xs font-medium text-stone-500">
                    <span>{t("checkout.startLabel")}</span>
                    <span className="text-stone-900 text-right">
                      {estimate.startDate
                        ? formatDate(estimate.startDate)
                        : t("checkout.pending")}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-xs font-medium text-stone-500">
                    <span>{t("checkout.readyLabel")}</span>
                    <span className="text-stone-900 text-right">
                      {estimate.readyFrom && estimate.readyTo
                        ? schedule.ready(estimate.readyFrom, estimate.readyTo)
                        : t("checkout.pending")}
                    </span>
                  </div>
                  <p className="pt-1 text-xs text-stone-500 leading-relaxed">
                    {fullyCoveredByCertificate
                      ? t("checkout.certificateFullCoverFooter")
                      : t("checkout.customNote")}
                  </p>
                  {readySelected.length > 0 && (
                    <p className="text-xs font-medium leading-relaxed text-stone-700">
                      {t("prepayment.accessoriesNote")}
                    </p>
                  )}
                  <p className="text-xs font-medium text-stone-700 leading-relaxed">
                    {t("deliveryAndPayment.noReturn")}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  (orderType === "ready-made" && cartItems.length === 0) ||
                  isSubmitting ||
                  (certificateEntered && (cert.loading || !cert.valid))
                }
                  className="w-full btn-ember rounded-2xl px-8 py-4 text-sm font-semibold uppercase tracking-widest duration-300 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? t("checkout.processing") : t("checkout.confirmOrder")}
                {!isSubmitting && (
                  <LuChevronRight
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
