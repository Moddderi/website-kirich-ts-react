import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";

import {
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineCamera,
} from "react-icons/hi";
import { LiaGlobeSolid } from "react-icons/lia";

export const DeliveryAndPaymentPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-12 lg:py-24 animate-reveal-up">
      <Breadcrumbs />

      {/* Заголовок */}
      <div className="mt-4 mb-16 border-b border-stone-200/60 pb-8">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tighter text-stone-900">
          {t("deliveryAndPayment.title")}
        </h1>
        <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mt-4">
          K.I.RICH • POLTAVA
        </p>
      </div>

      <div className="flex flex-col gap-20">
        {/* Основные условия */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-8 rounded-3xl border border-stone-200/60 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-stone-100 rounded-2xl text-stone-900">
                <HiOutlineDocumentText size={24} />
              </div>
              <h2 className="text-lg font-semibold text-stone-900">
                {t("deliveryAndPayment.generalConditions")}
              </h2>
            </div>
            <ul className="text-sm text-stone-600 space-y-4 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-stone-400">•</span>
                <span>
                  <Trans i18nKey="deliveryAndPayment.condition1" components={{ strong: <strong /> }} />
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-stone-400">•</span>
                <span>
                  {t("deliveryAndPayment.condition2")}
                </span>
              </li>
              
            </ul>
          </div>

          <div className="bg-stone-900 text-white p-8 rounded-3xl flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white">
                <HiOutlineShieldCheck size={24} />
              </div>
              <h2 className="text-lg font-semibold">{t("deliveryAndPayment.customTailoring")}</h2>
            </div>
            <div className="text-sm text-stone-300 space-y-4 relative z-10 leading-relaxed">
              <p>
                {t("deliveryAndPayment.customPaymentDesc")}
              </p>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-400">{t("deliveryAndPayment.prepayment")}</span>
                  <span className="font-semibold text-white text-base">
                    30%
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[30%] rounded-full"></div>
                </div>
                <p className="text-[11px] text-stone-400 mt-2">
                  {t("deliveryAndPayment.prepaymentNote")}
                </p>
              </div>
              <p className="text-xs">
                {t("deliveryAndPayment.restPayment")}
              </p>
            </div>
          </div>
        </section>

        {/* Условия доставки */}
        <section className="bg-beige-50 border border-stone-200/40 p-8 sm:p-12 rounded-4xl flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-shrink-0">
            <div className="p-4 bg-white shadow-sm border border-stone-200/60 rounded-2xl text-stone-900">
              <HiOutlineTruck size={32} />
            </div>
          </div>
          <div className="flex flex-col gap-6 w-full">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                {t("deliveryAndPayment.deliveryConditions")}
              </h2>
              <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">
                {t("deliveryAndPayment.worldwide")}
              </p>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              {t("deliveryAndPayment.deliveryDesc")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-stone-200/60 px-5 py-4 rounded-2xl text-center text-xs font-semibold text-stone-800 shadow-xs">
                Нова Пошта
              </div>
              <div className="bg-white border border-stone-200/60 px-5 py-4 rounded-2xl text-center text-xs font-semibold text-stone-800 shadow-xs">
                Укрпошта
              </div>
              <div className="bg-white border border-stone-200/60 px-5 py-4 rounded-2xl text-center text-xs font-semibold text-stone-800 shadow-xs">
                EMS
              </div>
            </div>

            <ul className="text-xs text-stone-500 space-y-2 mt-4 border-t border-stone-200/60 pt-6 leading-relaxed">
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  {t("deliveryAndPayment.deliveryNote1")}
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  {t("deliveryAndPayment.deliveryNote2")}
                </span>
              </li>
              <li className="flex gap-2 text-red-600/90 font-medium">
                <span>•</span>
                <span>
                  {t("deliveryAndPayment.deliveryWarning")}
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Способы оплаты */}
        <section className="flex flex-col gap-10">
          <div>
            <h2 className="text-2xl font-semibold text-stone-900">
              {t("deliveryAndPayment.paymentMethods")}
            </h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {t("deliveryAndPayment.paymentDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Карточка 1: Карта */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200/60 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-stone-100 rounded-2xl text-stone-900">
                    <HiOutlineCreditCard size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 px-3 py-1 rounded-full text-stone-600">
                    {t("deliveryAndPayment.recommended")}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-stone-900">
                  {t("deliveryAndPayment.cardTransfer")}
                </h3>

                <p className="text-sm text-stone-600 mt-6 leading-relaxed">
                  {t("deliveryAndPayment.cardTransferDesc")}
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl text-[11px] text-stone-500 leading-relaxed">
                <strong className="block text-stone-700 mb-1">
                  {t("deliveryAndPayment.workOrder")}
                </strong>
                {t("deliveryAndPayment.workOrderDesc")}
              </div>
            </div>

            {/* Карточка 2: SWIFT */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200/60 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-stone-100 rounded-2xl text-stone-900">
                    <LiaGlobeSolid size={24} />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-stone-900">
                  {t("deliveryAndPayment.swiftTransfer")}
                </h3>
                <p className="text-xs text-stone-400 font-medium mt-1 uppercase tracking-widest">
                  {t("deliveryAndPayment.forInternational")}
                </p>

                <p className="text-sm text-stone-600 mt-6 leading-relaxed">
                  {t("deliveryAndPayment.swiftDesc")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl text-[11px] text-stone-500 leading-relaxed">
                  {t("deliveryAndPayment.swiftNote")}
                </div>
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-xs font-medium text-red-800 leading-relaxed">
                  <strong className="block text-red-900 mb-1">
                    {t("deliveryAndPayment.swiftImportant")}
                  </strong>
                  <Trans i18nKey="deliveryAndPayment.swiftWarning" components={{ strong: <strong /> }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Право на публікацію фото */}
        <section className="bg-white border border-stone-200/60 p-8 rounded-3xl flex gap-5 items-start">
          <div className="p-3 bg-stone-100 rounded-2xl text-stone-900 shrink-0">
            <HiOutlineCamera size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              {t("deliveryAndPayment.photoRightsTitle")}
            </h2>
            <p className="text-sm text-stone-600 mt-3 leading-relaxed">
              {t("deliveryAndPayment.photoRightsDesc")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
