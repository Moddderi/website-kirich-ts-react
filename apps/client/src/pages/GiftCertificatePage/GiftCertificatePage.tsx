/* eslint-disable react-hooks/incompatible-library */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  GIFT_CERTIFICATE_AMOUNTS_UAH,
  giftCertificatePurchaseSchema,
  formatPrice,
  type GiftCertificatePurchase,
} from "@project/shared";
import { purchaseGiftCertificate } from "../../api/certificateApi";
import { FaInstagram, FaTelegram, FaViber, FaWhatsapp } from "react-icons/fa6";
import { LuChevronRight } from "react-icons/lu";
import { SiSignal } from "react-icons/si";
import { useHomeImages } from "../../constants/homeImages";
import { optimizeCloudinaryUrl } from "../../utils/cloudinary";
import {
  NovaPoshtaIcon,
  UkrposhtaIcon,
} from "../../components/DeliveryIcons/DeliveryIcons";

const PHONE_CONTACT_METHODS = new Set([
  "whatsapp",
  "viber",
  "signal",
] as const);

const MESSENGERS = [
  { value: "telegram", label: "Telegram", Icon: FaTelegram, color: "#2AABEE" },
  { value: "instagram", label: "Instagram", Icon: FaInstagram, color: "url(#gift-ig)" },
  { value: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp, color: "#25D366" },
  { value: "viber", label: "Viber", Icon: FaViber, color: "#7360F2" },
  { value: "signal", label: "Signal", Icon: SiSignal, color: "#3A76F0" },
] as const;

const inputClass = (hasError: boolean) =>
  `block w-full rounded-xl border-0 bg-white py-3.5 px-4 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
    hasError ? "ring-red-500 focus:ring-red-500" : "ring-stone-200 focus:ring-accent/70"
  }`;

const FormCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-4xl border border-stone-200/60 bg-white p-6 shadow-sm sm:p-8">
    <h2 className="mb-1 text-lg font-semibold tracking-tight text-stone-900">
      {title}
    </h2>
    {subtitle && <p className="mb-5 text-xs text-stone-500">{subtitle}</p>}
    {children}
  </div>
);

export const GiftCertificatePage = () => {
  const { t } = useTranslation();
  const homeImages = useHomeImages();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GiftCertificatePurchase>({
    resolver: zodResolver(giftCertificatePurchaseSchema),
    defaultValues: {
      amountUah: 1000,
      paymentMethod: "online",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      communicationMethod: "telegram",
      socialUsername: "",
      comment: "",
      requestPhysicalDelivery: false,
      deliveryMethod: "nova_poshta",
      city: "",
      warehouse: "",
    },
  });

  const amountUah = watch("amountUah");
  const communicationMethod = watch("communicationMethod");
  const requestPhysicalDelivery = watch("requestPhysicalDelivery");
  const deliveryMethod = watch("deliveryMethod");
  const messenger = MESSENGERS.find((m) => m.value === communicationMethod);

  const contactFieldLabel =
    communicationMethod === "whatsapp"
      ? t("checkout.whatsappPhone")
      : communicationMethod === "viber"
        ? t("checkout.viberPhone")
        : communicationMethod === "signal"
          ? t("checkout.signalPhone")
          : t("checkout.nickname", { network: messenger?.label ?? "" });

  const usesPhoneContact = PHONE_CONTACT_METHODS.has(
    communicationMethod as "whatsapp" | "viber" | "signal",
  );

  const onSubmit = async (data: GiftCertificatePurchase) => {
    setIsSubmitting(true);
    try {
      const result = await purchaseGiftCertificate({
        ...data,
        paymentMethod: "online",
      });
      if (result.success && result.certificate) {
        navigate("/gift-certificate/success", {
          state: { certificate: result.certificate },
        });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const resData = err.response?.data as
          | { message?: string; errors?: Array<{ message?: string }> }
          | undefined;
        const validation = resData?.errors?.[0]?.message;
        alert(
          resData?.message ?? validation ?? t("giftCertificate.serverError"),
        );
      } else {
        alert(t("giftCertificate.serverError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20 animate-reveal-up">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-beige-600">
          {t("giftCertificate.pageKicker")}
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl">
          {t("giftCertificate.pageTitle")}
        </h1>
        <p className="mt-3 text-sm font-medium text-stone-500">
          {t("giftCertificate.pageDesc")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16"
      >
        <div className="min-w-0 space-y-8 lg:col-span-7">
          <div className="overflow-hidden rounded-4xl border border-stone-200/60">
            <img
              src={optimizeCloudinaryUrl(homeImages.giftCertificate, {
                width: 800,
              })}
              alt=""
              width={800}
              height={600}
              className="aspect-4/3 w-full object-cover"
            />
          </div>

          <FormCard
            title={t("giftCertificate.amountTitle")}
            subtitle={t("giftCertificate.amountDesc")}
          >
            <div className="flex flex-wrap gap-2">
              {GIFT_CERTIFICATE_AMOUNTS_UAH.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() =>
                    setValue("amountUah", amount, { shouldValidate: true })
                  }
                  className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition ${
                    amountUah === amount
                      ? "border-accent bg-accent/10 text-stone-900"
                      : "border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {formatPrice(amount, "UAH")}
                </button>
              ))}
            </div>
            {errors.amountUah && (
              <p className="mt-2 text-xs font-medium text-red-500">
                {errors.amountUah.message}
              </p>
            )}
          </FormCard>

          <FormCard title={t("checkout.contactData")} subtitle={t("giftCertificate.contactBuyerNote")}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {(
                [
                  ["firstName", "checkout.firstName", "checkout.firstNamePlaceholder"],
                  ["lastName", "checkout.lastName", "checkout.lastNamePlaceholder"],
                  ["phone", "checkout.phone", "+380000000000"],
                  ["email", "checkout.email", "your@email.com"],
                ] as const
              ).map(([name, labelKey, placeholder]) => (
                <div
                  key={name}
                  className={name === "email" ? "sm:col-span-2" : undefined}
                >
                  <label className="mb-2.5 block text-xs font-semibold uppercase tracking-widest text-stone-900">
                    {t(labelKey)}
                  </label>
                  <input
                    type={
                      name === "email" ? "email" : name === "phone" ? "tel" : "text"
                    }
                    {...register(name)}
                    placeholder={placeholder.startsWith("checkout.") ? t(placeholder) : placeholder}
                    className={inputClass(!!errors[name])}
                  />
                  {errors[name] && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      {errors[name]?.message as string}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-stone-100 pt-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-stone-900">
                {t("checkout.whereToWrite")}
              </h3>
              <p className="mb-4 text-xs text-stone-500">
                {t("checkout.messengerNote")}
              </p>
              <svg width="0" height="0" className="absolute" aria-hidden>
                <defs>
                  <linearGradient id="gift-ig" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fccc63" />
                    <stop offset="35%" stopColor="#f77737" />
                    <stop offset="65%" stopColor="#e1306c" />
                    <stop offset="100%" stopColor="#833ab4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="relative mb-5 flex flex-wrap gap-2.5" role="radiogroup">
                {MESSENGERS.map(({ value, label, Icon, color }) => (
                  <label
                    key={value}
                    className={`inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 transition ${
                      communicationMethod === value
                        ? "border-accent bg-accent/10"
                        : "border-stone-200"
                    }`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...register("communicationMethod")}
                      className="h-4 w-4 accent-stone-900"
                    />
                    <Icon size={16} style={{ color, fill: color }} aria-hidden />
                    <span className="text-sm font-semibold">{label}</span>
                  </label>
                ))}
              </div>
              <label className="mb-2.5 block text-xs font-semibold uppercase tracking-widest text-stone-900">
                {contactFieldLabel}
              </label>
              <div className="relative rounded-xl shadow-sm">
                {!usesPhoneContact && (
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-sm font-semibold text-stone-400">@</span>
                  </div>
                )}
                <input
                  type="text"
                  {...register("socialUsername")}
                  className={`block w-full rounded-xl border-0 bg-white py-3.5 text-sm font-medium text-stone-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-stone-400 focus:ring-2 ${
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
          </FormCard>

          <FormCard title={t("giftCertificate.paymentTitle")}>
            <p className="text-sm font-medium leading-relaxed text-stone-800">
              {t("giftCertificate.paymentOnlineOnly")}
            </p>
          </FormCard>

          <FormCard
            title={t("giftCertificate.physicalTitle")}
            subtitle={t("giftCertificate.physicalDesc")}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                {...register("requestPhysicalDelivery")}
                className="mt-1 h-4 w-4 rounded accent-stone-900"
              />
              <span className="text-sm font-medium leading-relaxed text-stone-800">
                {t("giftCertificate.physicalCheckbox")}
              </span>
            </label>

            {requestPhysicalDelivery && (
              <div className="mt-6 space-y-6 border-t border-stone-100 pt-6 animate-fade-in">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-900">
                  {t("checkout.delivery")}
                </h3>
                <div className="space-y-3">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      deliveryMethod === "nova_poshta"
                        ? "border-accent bg-accent/10"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value="nova_poshta"
                      {...register("deliveryMethod")}
                      className="h-4 w-4 accent-stone-900"
                    />
                    <NovaPoshtaIcon size={24} className="shrink-0 text-[#ED1C24]" />
                    <span className="text-sm font-semibold text-stone-900">
                      {t("checkout.novaPoshta")}
                    </span>
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      deliveryMethod === "ukrposhta"
                        ? "border-accent bg-accent/10"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value="ukrposhta"
                      {...register("deliveryMethod")}
                      className="h-4 w-4 accent-stone-900"
                    />
                    <UkrposhtaIcon size={22} className="shrink-0 text-[#E6B800]" />
                    <span className="text-sm font-semibold text-stone-900">
                      {t("checkout.ukrposhta")}
                    </span>
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      deliveryMethod === "pickup"
                        ? "border-accent bg-accent/10"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value="pickup"
                      {...register("deliveryMethod")}
                      className="h-4 w-4 accent-stone-900"
                    />
                    <span className="text-sm font-semibold text-stone-900">
                      {t("checkout.pickup")}
                    </span>
                  </label>
                </div>
                {errors.deliveryMethod && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.deliveryMethod.message}
                  </p>
                )}

                {(deliveryMethod === "nova_poshta" ||
                  deliveryMethod === "ukrposhta") && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2.5 block text-xs font-semibold uppercase tracking-widest text-stone-900">
                        {t("checkout.city")}
                      </label>
                      <input
                        type="text"
                        {...register("city")}
                        placeholder={t("checkout.cityPlaceholder")}
                        className={inputClass(!!errors.city)}
                      />
                      {errors.city && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2.5 block text-xs font-semibold uppercase tracking-widest text-stone-900">
                        {t("checkout.warehouse")}
                      </label>
                      <input
                        type="text"
                        {...register("warehouse")}
                        placeholder={t("checkout.warehousePlaceholder")}
                        className={inputClass(!!errors.warehouse)}
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
            )}
          </FormCard>
        </div>

        <div className="mt-10 lg:col-span-5 lg:mt-0">
          <div className="lg:sticky lg:top-28 rounded-4xl border border-stone-200/60 bg-white p-8 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-900">
              {t("giftCertificate.summaryTitle")}
            </h2>
            <p className="mt-4 text-sm text-stone-500">
              {t("giftCertificate.summaryDesc")}
            </p>
            <div className="mt-6 flex items-end justify-between border-t border-stone-100 pt-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-900">
                {t("checkout.total")}
              </span>
              <span className="text-2xl font-semibold text-stone-900">
                {formatPrice(amountUah, "UAH")}
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-stone-500">
              {t("giftCertificate.afterPurchaseNote")}
            </p>
            <div className="mt-6 rounded-2xl border border-stone-200/80 bg-stone-50/80 px-4 py-4 text-left">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-900">
                {t("giftCertificate.termsTitle")}
              </p>
              <ul className="mt-3 space-y-2.5 text-xs font-medium leading-relaxed text-stone-600">
                <li className="flex gap-2">
                  <span className="text-accent" aria-hidden>
                    ·
                  </span>
                  <span>{t("giftCertificate.termsActivation")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent" aria-hidden>
                    ·
                  </span>
                  <span>{t("giftCertificate.termsValidity")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent" aria-hidden>
                    ·
                  </span>
                  <span>{t("giftCertificate.termsEmail")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent" aria-hidden>
                    ·
                  </span>
                  <span>{t("giftCertificate.termsRedeem")}</span>
                </li>
                {requestPhysicalDelivery && (
                  <li className="flex gap-2">
                    <span className="text-accent" aria-hidden>
                      ·
                    </span>
                    <span>{t("giftCertificate.termsPhysical")}</span>
                  </li>
                )}
              </ul>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-ember mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-semibold uppercase tracking-widest disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? t("checkout.processing") : t("giftCertificate.submit")}
              {!isSubmitting && <LuChevronRight size={16} />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};