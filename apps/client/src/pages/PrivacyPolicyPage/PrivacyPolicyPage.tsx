import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";

import {
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineServer,
  HiOutlineChartBar,
  HiOutlineDocumentDuplicate,
} from "react-icons/hi";

export const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-12 lg:py-24 animate-reveal-up">
      <Breadcrumbs />

      {/* Заголовок */}
      <div className="mt-4 mb-16 border-b border-stone-200/60 pb-8">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tighter text-stone-900">
          {t("privacyPolicy.title")}
        </h1>
        <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mt-4">
          K.I.RICH SEWING STUDIO • ПОЛТАВА
        </p>
      </div>

      <div className="flex flex-col gap-16 text-sm text-stone-600 leading-relaxed">
        {/* Введение */}
        <section className="bg-beige-50 border border-stone-200/40 p-8 sm:p-10 rounded-4xl flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-shrink-0 p-4 bg-white shadow-sm border border-stone-200/60 rounded-2xl text-stone-900">
            <HiOutlineShieldCheck size={32} />
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            <Trans i18nKey="privacyPolicy.intro" components={{ strong: <strong /> }} />
          </p>
        </section>

        {/* Получение персональной информации */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-100 rounded-2xl text-stone-900">
              <HiOutlineUser size={24} />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">
              {t("privacyPolicy.personalInfo")}
            </h2>
          </div>

          <p>
            {t("privacyPolicy.personalInfoDesc1")}
          </p>

          <p>
            {t("privacyPolicy.personalInfoDesc2")}
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-medium text-center">
            <li className="bg-white border border-stone-200/60 py-4 px-6 rounded-2xl shadow-xs">
              {t("privacyPolicy.nameAndSurname")}
            </li>
            <li className="bg-white border border-stone-200/60 py-4 px-6 rounded-2xl shadow-xs">
              {t("privacyPolicy.contactDetails")}
            </li>
            <li className="bg-white border border-stone-200/60 py-4 px-6 rounded-2xl shadow-xs">
              {t("privacyPolicy.emailAddress")}
            </li>
          </ul>

          <p className="text-xs text-stone-400 mt-4">
            {t("privacyPolicy.voluntaryNote")}
          </p>
        </section>

        {/* Как обрабатывается информация */}
        <section className="space-y-6 bg-white p-8 rounded-3xl border border-stone-200/60">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-100 rounded-2xl text-stone-900">
              <HiOutlineChartBar size={24} />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">
              {t("privacyPolicy.howProcessed")}
            </h2>
          </div>

          <p>
            {t("privacyPolicy.howProcessedDesc")}
          </p>

          <ul className="space-y-3 pl-2 text-stone-600">
            <li className="flex gap-3">
              <span className="text-stone-400">•</span>
              <span>
                {t("privacyPolicy.process1")}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-stone-400">•</span>
              <span>{t("privacyPolicy.process2")}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-stone-400">•</span>
              <span>
                {t("privacyPolicy.process3")}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-stone-400">•</span>
              <span>{t("privacyPolicy.process4")}</span>
            </li>
            
          </ul>
        </section>

        {/* Статическая информация и защита */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 bg-stone-900 text-white p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white">
                <HiOutlineServer size={24} />
              </div>
              <h2 className="text-lg font-semibold">{t("privacyPolicy.staticInfo")}</h2>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed relative z-10">
              {t("privacyPolicy.staticInfoDesc")}
            </p>
          </div>

          <div className="space-y-4 bg-white p-8 rounded-3xl border border-stone-200/60 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                {t("privacyPolicy.howProtected")}
              </h2>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              {t("privacyPolicy.howProtectedDesc")}
            </p>
          </div>
        </section>

        {/* Веб-аналитика */}
        <section className="space-y-4 bg-beige-50 border border-stone-200/40 p-8 rounded-3xl">
          <h2 className="text-lg font-semibold text-stone-900">
            {t("privacyPolicy.analytics")}
          </h2>
          <p>{t("privacyPolicy.analyticsDesc")}</p>
        </section>

        {/* Файлы cookies */}
        <section className="space-y-6 border-t border-stone-200/60 pt-12">
          <div>
            <h2 className="text-xl font-semibold text-stone-900 flex items-center gap-4">
              <div className="p-3 bg-stone-100 rounded-2xl text-stone-900">
                <HiOutlineDocumentDuplicate size={24} />
              </div>
              {t("privacyPolicy.cookies")}
            </h2>
            <p className="text-xs text-stone-400 font-medium mt-2 uppercase tracking-widest">
              {t("privacyPolicy.cookiesSubtitle")}
            </p>
          </div>

          <p>
            {t("privacyPolicy.cookiesDesc1")}
          </p>

          <p>
            {t("privacyPolicy.cookiesDesc2")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div className="bg-stone-50 border border-stone-200/60 p-5 rounded-2xl text-xs text-stone-600 leading-relaxed">
              <strong className="block text-stone-900 font-semibold mb-2">
                {t("privacyPolicy.cookiesForms")}
              </strong>
              {t("privacyPolicy.cookiesFormsDesc")}
            </div>
            <div className="bg-stone-50 border border-stone-200/60 p-5 rounded-2xl text-xs text-stone-600 leading-relaxed">
              <strong className="block text-stone-900 font-semibold mb-2">
                {t("privacyPolicy.cookiesSettings")}
              </strong>
              {t("privacyPolicy.cookiesSettingsDesc")}
            </div>
            <div className="bg-stone-50 border border-stone-200/60 p-5 rounded-2xl text-xs text-stone-600 leading-relaxed">
              <strong className="block text-stone-900 font-semibold mb-2">
                {t("privacyPolicy.cookiesCart")}
              </strong>
              {t("privacyPolicy.cookiesCartDesc")}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
