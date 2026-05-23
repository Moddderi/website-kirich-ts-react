import React from "react";

export const IndividualTailoringPage = () => {
  return (
    // Контейнер, который центрирует карточку по горизонтали и вертикали
    <div className="w-full flex items-center justify-center p-4 sm:p-6 min-h-screen">
      {/* Сама карточка */}
      <div className="relative w-full max-w-2xl bg-stone-950 text-white rounded-[2rem] border border-stone-800 shadow-2xl flex flex-col p-8 sm:p-12 cursor-default overflow-hidden">
        {/* Паттерны на фоне */}
        <div className="absolute inset-0 bg-grid-pattern-dark mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent) pointer-events-none"></div>
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-bl from-beige-300/10 to-transparent blur-[80px] animate-pulse-glow pointer-events-none"></div>

        <div className="relative z-20 flex flex-col h-full">
          {/* Верхняя панель: Заголовок */}
          <div className="flex items-center gap-3 mb-10">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              {/* <iconify-icon icon="solar:pen-new-square-linear" width="20" className="text-white"></iconify-icon> */}
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Как это работает
              </h2>
              <p className="text-xs font-medium text-stone-400 mt-1">
                Процесс создания идеального платья
              </p>
            </div>
          </div>

          {/* Контентная часть (Шаги) */}
          <div className="flex-grow flex flex-col justify-center space-y-8 py-2">
            <div className="flex gap-6 items-start group/step">
              <div className="flex flex-col items-center mt-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs font-semibold text-stone-300 group-hover/step:bg-white group-hover/step:text-stone-900 transition-colors">
                  1
                </span>
                <div className="h-12 w-px bg-white/10 mt-2"></div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  Выбор базы и ткани
                  {/* <iconify-icon icon="solar:swatchbook-linear" width="16" className="text-stone-400"></iconify-icon> */}
                </h4>
                <p className="text-sm font-medium text-stone-400 leading-relaxed max-w-xl">
                  Выберите силуэт из каталога или прикрепите свой эскиз. Мы
                  предложим варианты тканей и фурнитуры.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start group/step">
              <div className="flex flex-col items-center mt-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs font-semibold text-stone-300 group-hover/step:bg-white group-hover/step:text-stone-900 transition-colors">
                  2
                </span>
                <div className="h-12 w-px bg-white/10 mt-2"></div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  Снятие мерок
                  {/* <iconify-icon icon="solar:ruler-cross-pen-linear" width="16" className="text-stone-400"></iconify-icon> */}
                </h4>
                <p className="text-sm font-medium text-stone-400 leading-relaxed max-w-xl">
                  Запишитесь в студию в Киеве или воспользуйтесь нашей подробной
                  видео-инструкцией для онлайн-мерок.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start group/step">
              <div className="flex flex-col items-center mt-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs font-semibold text-stone-300 group-hover/step:bg-white group-hover/step:text-stone-900 transition-colors">
                  3
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  Пошив и примерка
                  {/* <iconify-icon icon="solar:magic-stick-3-linear" width="16" className="text-stone-400"></iconify-icon> */}
                </h4>
                <p className="text-sm font-medium text-stone-400 leading-relaxed max-w-xl">
                  Создание макета, промежуточная примерка (очно или по
                  видеосвязи) и финальная доработка изделия.
                </p>
              </div>
            </div>
          </div>

          {/* Кнопки действия */}
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 rounded-xl bg-white px-6 py-4 text-sm font-semibold text-stone-900 hover:scale-[1.02] transition-transform duration-300 active:scale-98 text-center">
              Записаться в студию
            </button>
            <button className="flex-1 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm flex items-center justify-center gap-2">
              {/* <iconify-icon icon="solar:chat-round-line-linear" width="18"></iconify-icon> */}
              Чат с мастером
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
