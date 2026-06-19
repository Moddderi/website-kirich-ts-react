import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";

import {
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { LiaGlobeSolid } from "react-icons/lia";

export const DeliveryAndPaymentPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-12 lg:py-24 animate-reveal-up">
      <Breadcrumbs />

      {/* Заголовок */}
      <div className="mt-4 mb-16 border-b border-stone-200/60 pb-8">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tighter text-stone-900">
          Доставка та оплата
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
                Загальні умови
              </h2>
            </div>
            <ul className="text-sm text-stone-600 space-y-4 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-stone-400">•</span>
                <span>
                  <strong>Мінімальне роздрібне замовлення</strong> — 1 одиниця
                  товару, незалежно від вашого місцеперебування та країни
                  доставки.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-stone-400">•</span>
                <span>
                  Після оформлення замовлення з Вами зв'яжеться менеджер для
                  уточнення деталей, після чого надішле рахунок на оплату
                  зручним для Вас способом.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-stone-400">•</span>
                <span>
                  Замовлення виконуються в обговорені терміни. У разі
                  завантаженості виробництва або залежно від ситуації в країні
                  терміни можуть збільшуватись.
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
              <h2 className="text-lg font-semibold">Індивідуальне пошиття</h2>
            </div>
            <div className="text-sm text-stone-300 space-y-4 relative z-10 leading-relaxed">
              <p>
                Оплата замовлень індивідуального пошиття здійснюється поетапно:
              </p>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-400">Передплата</span>
                  <span className="font-semibold text-white text-base">
                    30%
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[30%] rounded-full"></div>
                </div>
                <p className="text-[11px] text-stone-400 mt-2">
                  від суми замовлення береться в роботу
                </p>
              </div>
              <p className="text-xs">
                Решта суми сплачується по готовності замовлення.
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
                Умови доставки
              </h2>
              <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">
                По всьому світу
              </p>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              Протягом 1-2 робочих днів з моменту готовності замовлення Ваша
              посилка буде укомплектована та відправлена транспортною компанією:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-stone-200/60 px-5 py-4 rounded-2xl text-center text-xs font-semibold text-stone-800 shadow-xs">
                Нова Пошта
              </div>
              <div className="bg-white border border-stone-200/60 px-5 py-4 rounded-2xl text-center text-xs font-semibold text-stone-800 shadow-xs">
                Укрпошта
              </div>
              <div className="bg-white border border-stone-200/60 px-5 py-4 rounded-2xl text-center text-xs font-semibold text-stone-800 shadow-xs">
                EMS / DHL
              </div>
            </div>

            <ul className="text-xs text-stone-500 space-y-2 mt-4 border-t border-stone-200/60 pt-6 leading-relaxed">
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  Після відправки наш менеджер зв'яжеться з Вами та повідомить
                  усю необхідну інформацію для отримання посилки.
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  Усі витрати на транспортні послуги з доставки товару оплачує
                  Покупець.
                </span>
              </li>
              <li className="flex gap-2 text-red-600/90 font-medium">
                <span>•</span>
                <span>
                  У разі втрати або псування посилки наша студія не несе
                  відповідальності за надані послуги транспортної компанії.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Способы оплаты */}
        <section className="flex flex-col gap-10">
          <div>
            <h2 className="text-2xl font-semibold text-stone-900">
              Способи оплати
            </h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Оплата замовлень на території України здійснюється в національній
              валюті — українська гривня (₴). Якщо Ви перебуваєте за кордоном,
              Ви можете оплатити покупку у доларах ($) або євро (€) за курсом на
              день оплати.
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
                    Рекомендовано
                  </span>
                </div>
                <h3 className="text-base font-semibold text-stone-900">
                  Переказ на картку банків України
                </h3>
                <p className="text-xs text-stone-400 font-medium mt-1 uppercase tracking-widest">
                  ПриватБанк / Ощадбанк
                </p>

                <p className="text-sm text-stone-600 mt-6 leading-relaxed">
                  Найбільш сучасний і популярний спосіб оплати. Клієнт переказує
                  гроші на банківську картку студії через термінали чи
                  відділення, що займає всього декілька хвилин.
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl text-[11px] text-stone-500 leading-relaxed">
                <strong className="block text-stone-700 mb-1">
                  Порядок роботи:
                </strong>
                Отримавши передплату, ми беремо замовлення в роботу. Коли воно
                готове та залишок суми сплачений, ми відправляємо замовлення за
                вказаною адресою.
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
                  Валютний SWIFT-переказ
                </h3>
                <p className="text-xs text-stone-400 font-medium mt-1 uppercase tracking-widest">
                  Для міжнародних платежів
                </p>

                <p className="text-sm text-stone-600 mt-6 leading-relaxed">
                  Зручний спосіб оплати для клієнтів, які знаходяться за
                  кордоном. Переказ здійснюється на вказані реквізити студії в
                  обговореній валюті ($ або €).
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl text-[11px] text-stone-500 leading-relaxed">
                  Зверніть увагу: такі перекази зараховуються на рахунок студії
                  упродовж 1–5 робочих днів. Фіксовану банківську комісію за
                  валютне зарахування, а також митну комісію сплачує Покупець.
                </div>
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-xs font-medium text-red-800 leading-relaxed">
                  <strong className="block text-red-900 mb-1">
                    !!! Важливо:
                  </strong>
                  При оформленні SWIFT-переказу обов'язково вкажіть тип комісії{" "}
                  <strong>«FULL»</strong> або <strong>«OUR»</strong>.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
