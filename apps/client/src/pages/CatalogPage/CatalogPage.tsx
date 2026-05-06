import { ProductCard } from "../../components/ProductCard/ProductCard";

export const CatalogPage = () => {
  return (
    <main className="flex-grow pb-32">
      <section className="relative pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-grid-pattern mask-image:linear-gradient(to_bottom,white,transparent)"></div>
        <div className="absolute top-0 right-1/4 -z-10 w-[600px] h-[400px] bg-gradient-to-bl from-beige-200/50 to-transparent blur-[80px] rounded-full animate-pulse-glow"></div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="opacity-0 animate-reveal-up delay-300 mt-14 w-full flex flex-col items-center gap-5 z-20 relative">
            <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-1.5 p-1.5 rounded-full bg-stone-200/50 backdrop-blur-md border border-stone-200 overflow-x-auto w-full md:w-auto no-scrollbar px-2 md:px-1.5 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
              <button className="px-5 py-2 rounded-full text-stone-500 text-xs font-semibold tracking-widest uppercase hover:text-stone-900 transition-colors whitespace-nowrap">
                Одежда
              </button>
              <button className="px-5 py-2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-stone-100 text-stone-900 text-xs font-semibold tracking-widest uppercase transition-transform flex items-center gap-2 whitespace-nowrap">
                Аксессуары
              </button>
              <button className="px-5 py-2 rounded-full text-stone-500 text-xs font-semibold tracking-widest uppercase hover:text-stone-900 transition-colors whitespace-nowrap">
                Обувь
              </button>
              <button className="px-5 py-2 rounded-full text-stone-500 text-xs font-semibold tracking-widest uppercase hover:text-stone-900 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                {/* <iconify-icon icon="solar:gift-linear" width="14"></iconify-icon> */}
                Сертификаты
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-5xl px-4">
              <div className="hidden md:flex items-center gap-1.5 text-stone-400 mr-1">
                {/* <iconify-icon icon="solar:filter-linear" width="16"></iconify-icon> */}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button className="px-4 py-1.5 rounded-xl bg-stone-900 border border-stone-900 text-white text-xs font-medium shadow-sm transition-all hover:bg-stone-800">
                  Все аксессуары
                </button>
                <button className="px-4 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-600 text-xs font-medium shadow-sm hover:border-stone-900 hover:text-stone-900 transition-all">
                  Носки
                </button>
                <button className="px-4 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-600 text-xs font-medium shadow-sm hover:border-stone-900 hover:text-stone-900 transition-all">
                  Ремни
                </button>
                <button className="px-4 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-600 text-xs font-medium shadow-sm hover:border-stone-900 hover:text-stone-900 transition-all">
                  Галстуки и бабочки
                </button>
                <button className="px-4 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-600 text-xs font-medium shadow-sm hover:border-stone-900 hover:text-stone-900 transition-all">
                  Сумки и чехлы
                </button>
              </div>

              <div className="h-4 w-px bg-stone-300 mx-1 hidden lg:block"></div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button className="px-3 py-1.5 rounded-xl bg-transparent border border-stone-200 text-stone-500 text-xs font-medium hover:border-stone-400 hover:text-stone-900 hover:bg-white/50 transition-colors flex items-center gap-1.5 group">
                  Пол
                  {/* <iconify-icon icon="solar:alt-arrow-down-linear" width="12" className="text-stone-400 group-hover:text-stone-900 transition-colors"></iconify-icon> */}
                </button>
                <button className="px-3 py-1.5 rounded-xl bg-transparent border border-stone-200 text-stone-500 text-xs font-medium hover:border-stone-400 hover:text-stone-900 hover:bg-white/50 transition-colors flex items-center gap-1.5 group">
                  Цвет
                  {/* <iconify-icon icon="solar:alt-arrow-down-linear" width="12" className="text-stone-400 group-hover:text-stone-900 transition-colors"></iconify-icon> */}
                </button>
                <button className="px-3 py-1.5 rounded-xl bg-transparent border border-stone-200 text-stone-500 text-xs font-medium hover:border-stone-400 hover:text-stone-900 hover:bg-white/50 transition-colors flex items-center gap-1.5 group">
                  Сортировка
                  {/* <iconify-icon icon="solar:sort-from-top-to-bottom-linear" width="12" className="text-stone-400 group-hover:text-stone-900 transition-colors"></iconify-icon> */}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 auto-rows-max perspective-1000">
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>

        <div className="mt-24 flex justify-center text-center">
          <p className="text-sm font-medium text-stone-500 max-w-lg">
            Остались вопросы по ассортименту? Ознакомьтесь с{" "}
            <a
              href="#"
              className="text-stone-900 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900 transition-colors"
            >
              частыми вопросами
            </a>{" "}
            или напишите нам.
          </p>
        </div>
      </section>
    </main>
  );
};
