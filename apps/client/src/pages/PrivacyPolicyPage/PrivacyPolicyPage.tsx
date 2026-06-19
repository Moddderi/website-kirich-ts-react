import React from "react";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";

import {
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineServer,
  HiOutlineChartBar,
  HiOutlineDocumentDuplicate,
} from "react-icons/hi";

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-12 lg:py-24 animate-reveal-up">
      <Breadcrumbs />

      {/* Заголовок */}
      <div className="mt-4 mb-16 border-b border-stone-200/60 pb-8">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tighter text-stone-900">
          Політика безпеки
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
            Студія <strong>«K.I.RICH SEWING STUDIO»</strong> не тільки
            намагається задовольнити побажання клієнтів, а й піклується про
            захист особистих даних кожного покупця. Ми поважаємо Ваш вибір, тому
            докладаємо максимум зусиль для збереження конфіденційної інформації
            про клієнтів від посягань третіх осіб.
          </p>
        </section>

        {/* Получение персональной информации */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-100 rounded-2xl text-stone-900">
              <HiOutlineUser size={24} />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">
              Отримання персональної інформації
            </h2>
          </div>

          <p>
            Під час відвідування сайту наші клієнти можуть не переживати про
            відстеження їхніх дій, оскільки ми цього не робимо. Переглядаючи
            розділи, підрозділи та сторінки сервісу, Ви можете залишатися
            анонімом або отримати спеціальний анонімний гостьовий доступ до
            ресурсу. При цьому варто врахувати, що браузер автоматично інформує
            нашу компанію про тип електронного пристрою, з якого Ви виходите в
            Інтернет, а також про вид операційної системи, встановленої на
            ньому.
          </p>

          <p>
            Дані, які вказуються Вами при заповненні реєстраційної форми та
            полів замовлення, є єдиною особистою інформацією про Вас, якою ми
            володіємо. Вам може бути необхідно внести особисті дані наступного
            характеру:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-medium text-center">
            <li className="bg-white border border-stone-200/60 py-4 px-6 rounded-2xl shadow-xs">
              Ім’я та прізвище
            </li>
            <li className="bg-white border border-stone-200/60 py-4 px-6 rounded-2xl shadow-xs">
              Контактні дані
            </li>
            <li className="bg-white border border-stone-200/60 py-4 px-6 rounded-2xl shadow-xs">
              Електронна пошта
            </li>
          </ul>

          <p className="text-xs text-stone-400 mt-4">
            Надання даних є абсолютно добровільним і необхідне лише для того,
            щоб прискорити обробку замовлення, зробленого в нашій студії.
          </p>
        </section>

        {/* Как обрабатывается информация */}
        <section className="space-y-6 bg-white p-8 rounded-3xl border border-stone-200/60">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-100 rounded-2xl text-stone-900">
              <HiOutlineChartBar size={24} />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">
              Як обробляється особиста інформація про клієнтів?
            </h2>
          </div>

          <p>
            Відомості особистого характеру використовуються в межах вузьких
            завдань: при маркетинговому аналізі потреб цільової аудиторії, її
            побажань і рекомендацій. Зокрема, вони стають ефективним
            інструментом для:
          </p>

          <ul className="space-y-3 pl-2 text-stone-600">
            <li className="flex gap-3">
              <span className="text-stone-400">•</span>
              <span>
                Професійної допомоги, що надається нашими консультантами
                клієнтам під час замовлень.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-stone-400">•</span>
              <span>Виявлення та усунення недоліків обслуговування.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-stone-400">•</span>
              <span>
                Оповіщення про новини студії, нові надходження, чинні акції та
                знижки.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-stone-400">•</span>
              <span>Технічної підтримки користувачів.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-stone-400">•</span>
              <span>Розсилки рекламних пропозицій.</span>
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
              <h2 className="text-lg font-semibold">Статична інформація</h2>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed relative z-10">
              Для забезпечення безпроблемного функціонування сайту і для
              персонального аналізу статистичних даних трафіку ми досліджуємо
              IP-адреси відвідувань сайту. Зібрані дані ніяк не зачіпають
              особистого простору клієнтів, не стосуються глибоко персональної
              інформації, а обробляються виключно як узагальнена користувацька
              статистика.
            </p>
          </div>

          <div className="space-y-4 bg-white p-8 rounded-3xl border border-stone-200/60 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                Як захищається особиста інформація?
              </h2>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Усі дані, надані Вами, студія зберігає в надійній базі і не
              передає їх третім особам. Виключення становлять випадки, коли
              користувач сам погодився на їхню передачу, або в передбачених
              законом випадках. В інших ситуаціях студія зобов’язується
              дотримуватися конфіденційності інформації, керуючись принципами
              порядності та поваги до Покупця.
            </p>
          </div>
        </section>

        {/* Файлы cookies */}
        <section className="space-y-6 border-t border-stone-200/60 pt-12">
          <div>
            <h2 className="text-xl font-semibold text-stone-900 flex items-center gap-4">
              <div className="p-3 bg-stone-100 rounded-2xl text-stone-900">
                <HiOutlineDocumentDuplicate size={24} />
              </div>
              Файли «cookies»
            </h2>
            <p className="text-xs text-stone-400 font-medium mt-2 uppercase tracking-widest">
              Спрощують використання сайту
            </p>
          </div>

          <p>
            Фактично охорона особистих даних користувача не пов’язана з поняттям
            cookie. Файли «cookies» лише спрощують експлуатацію різних сайтів,
            автоматично збираючи певні види інформації. Вони являють собою
            текстові документи, які зберігаються сервером інтернет-сторінки на
            вінчестері електронного пристрою.
          </p>

          <p>
            Cookie ніяк не впливають на налаштування операційної системи або
            файли, розташовані на комп’ютері, проте істотно економлять час
            користувача. З їх допомогою можливо:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div className="bg-stone-50 border border-stone-200/60 p-5 rounded-2xl text-xs text-stone-600 leading-relaxed">
              <strong className="block text-stone-900 font-semibold mb-2">
                Заповнення форм
              </strong>
              Швидко заповнювати поля (ім’я, прізвище, адресу, електронну пошту,
              телефони та інше).
            </div>
            <div className="bg-stone-50 border border-stone-200/60 p-5 rounded-2xl text-xs text-stone-600 leading-relaxed">
              <strong className="block text-stone-900 font-semibold mb-2">
                Збереження налаштувань
              </strong>
              Зберігати власні налаштування на сайті для наступних відвідувань.
            </div>
            <div className="bg-stone-50 border border-stone-200/60 p-5 rounded-2xl text-xs text-stone-600 leading-relaxed">
              <strong className="block text-stone-900 font-semibold mb-2">
                Робота з Кошиком
              </strong>
              Залишати відкладені товари в Кошику для подальшого оформлення
              замовлення.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
