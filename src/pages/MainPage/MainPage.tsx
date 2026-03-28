import { RiVipCrown2Line } from "react-icons/ri";

export const MainPage = () => {
  return (
    <main className="flex-grow">
      <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-48">
        <div className="absolute inset-0 -z-20 bg-grid-pattern mask-image:linear-gradient(to_bottom,white,transparent)"></div>
        <div className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] animate-spin-slow opacity-60 mix-blend-multiply">
          <div className="absolute inset-0 bg-gradient-to-tr from-beige-200/60 via-transparent to-stone-200/40 blur-[100px] rounded-full"></div>
          <div className="absolute right-0 bottom-0 w-[600px] h-[400px] bg-gradient-to-bl from-white/80 to-transparent blur-[80px] rounded-full"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className=" animate-reveal-up delay-200 inline-flex items-center gap-3 rounded-full border border-stone-200/80 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-stone-700 backdrop-blur-xl mb-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all hover:scale-105 hover:bg-white duration-500 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-600"></span>
            </span>
            The Vanguard Collection
          </div>

          <h1 className=" animate-reveal-up delay-300 mx-auto max-w-5xl text-5xl font-semibold tracking-tighter text-stone-900 sm:text-7xl lg:text-8xl leading-[1.1]">
            Абсолютная форма <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-stone-700 to-stone-400">
                вашего движения
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-beige-200/50 -z-10 -rotate-1 origin-left scale-x-0 animate-[shimmer_2s_forwards_1s] delay-700"></div>
            </span>
          </h1>

          <p className=" animate-reveal-up delay-500 mx-auto mt-8 max-w-2xl text-lg text-stone-500 leading-relaxed font-medium">
            Бескомпромиссная бальная одежда мирового уровня. Создана в Киеве с
            маниакальным вниманием к каждой детали, чтобы вы доминировали на
            паркете.
          </p>

          <div className=" animate-reveal-up delay-700 mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
            <a
              href="#catalog"
              className="group relative w-full sm:w-auto rounded-xl bg-stone-900 px-8 py-4 text-sm font-semibold text-white shadow-2xl shadow-stone-900/30 hover:bg-stone-800 hover:-translate-y-1 transition-all duration-500 overflow-hidden flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <span className="relative z-10">Исследовать коллекцию</span>
              {/* <iconify-icon icon="solar:arrow-right-linear" width="18" stroke-width="1.5" className="relative z-10 transform group-hover:translate-x-2 transition-transform duration-500"></iconify-icon> */}
            </a>
            <a
              href="#about"
              className="group w-full sm:w-auto rounded-xl border border-stone-200/80 bg-white/40 backdrop-blur-md px-8 py-4 text-sm font-semibold text-stone-900 shadow-sm hover:border-stone-900 hover:bg-white transition-all duration-500 flex items-center justify-center gap-2"
            >
              Философия бренда
              <div className="h-1.5 w-1.5 rounded-full bg-stone-300 group-hover:bg-stone-900 transition-colors duration-500 ml-1"></div>
            </a>
          </div>

          <div className="hidden lg:flex absolute top-1/4 -right-16 animate-float-complex items-center gap-4 rounded-3xl border border-white/60 bg-white/40 p-5 backdrop-blur-2xl shadow-[0_20px_40px_rgba(28,25,23,0.05)] w-72 text-left glass-reflection hover:scale-105 hover:bg-white/60 transition-all duration-500 z-20">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-lg shadow-stone-900/20 relative">
              <div className="absolute inset-0 rounded-2xl border border-white/20 animate-pulse-glow"></div>
              {/* <iconify-icon icon="solar:ruler-cross-pen-linear" width="24" stroke-width="1.5"></iconify-icon> */}
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-stone-900">
                Точность до 1 мм
              </p>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                Безупречная архитектура кроя
              </p>
            </div>
          </div>

          <div className="hidden lg:flex absolute bottom-1/4 -left-12 animate-float-reverse items-center gap-4 rounded-3xl border border-white/60 bg-white/40 p-5 backdrop-blur-2xl shadow-[0_20px_40px_rgba(28,25,23,0.05)] w-64 text-left glass-reflection hover:scale-105 hover:bg-white/60 transition-all duration-500 z-20 delay-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-beige-200/80 text-stone-800 border border-white/80">
              {/* <iconify-icon icon="solar:global-linear" width="24" stroke-width="1.5"></iconify-icon> */}
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-stone-900">
                Kyiv, Ukraine
              </p>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                Создано вручную
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-stone-200/40 bg-stone-950 py-32 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-beige-50/80 via-transparent to-transparent opacity-50 pointer-events-none" />

        <div className="mx-auto max-w-6xl px-6 lg:px-8 relative z-10 perspective-1000">
          {/* HEADER */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-semibold tracking-tighter text-stone-900 sm:text-5xl">
              Архитектура вашего заказа
            </h2>
            <p className="mt-6 text-sm text-stone-500 max-w-2xl mx-auto font-medium">
              Два бескомпромиссных пути к созданию вашего идеального образа.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative transform-3d">
            {/* CARD 1 */}
            <div className="relative cursor-pointer group hover-lift transition-all duration-700 ease-out">
              <div className="absolute inset-0 rounded-[2rem] border border-stone-600 bg-stone-900 transition-all duration-700 group-hover:border-stone-400 group-hover:ring-1 group-hover:ring-stone-900  overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-beige-100/0 via-beige-100/0 to-stone-200/0 group-hover:from-beige-50/80 group-hover:to-transparent transition-all duration-700" />
                <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
              </div>

              <div className="relative h-full p-10 sm:p-12 flex flex-col">
                <div className="flex items-start justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-stone-800 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3  text-white shadow-sm ring-1 ring-white/10">
                      <RiVipCrown2Line size={25} />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Bespoke / Индивидуально
                      </h3>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="h-2 w-2 rounded-full bg-white relative">
                          <span className="absolute h-full w-full rounded-full bg-white opacity-40 animate-ping" />
                        </span>
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                          Абсолютная точность
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-stone-500 leading-relaxed mb-10 flex-grow font-medium">
                  Премиальный индивидуальный пошив по вашим меркам.
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-stone-300 bg-stone-950/50 rounded-2xl p-6 border border-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] group-hover:border-stone-700">
                  <div className="group-hover:translate-x-1 transition-transform duration-300">
                    Посадка до миллиметра
                  </div>
                  <div className="group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    Премиум ткани
                  </div>
                  <div className="group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    3
                  </div>
                  <div className="group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    4
                  </div>
                </div>

                <a
                  href="#"
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 text-sm font-bold text-stone-900  hover:bg-stone-400  transition-all duration-300"
                >
                  Каталог Bespoke
                  {/* <iconify-icon icon="solar:arrow-right-linear" width="18" class="transform group-hover/btn:translate-x-1 transition-transform"></iconify-icon> */}
                </a>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="relative cursor-pointer group hover-lift transition-all duration-700 ease-out">
              <div className="absolute inset-0 rounded-[2rem] border border-stone-600 bg-stone-900 transition-all duration-700 group-hover:border-stone-400 group-hover:ring-1 group-hover:ring-stone-900  overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-beige-100/0 via-beige-100/0 to-stone-200/0 group-hover:from-beige-50/80 group-hover:to-transparent transition-all duration-700" />
                <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
              </div>

              <div className="relative h-full p-10 sm:p-12 flex flex-col">
                <div className="flex items-start justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-stone-800 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3  text-white shadow-sm ring-1 ring-white/10">
                      <RiVipCrown2Line size={25} />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Bespoke / Индивидуально
                      </h3>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="h-2 w-2 rounded-full bg-white relative">
                          <span className="absolute h-full w-full rounded-full bg-white opacity-40 animate-ping" />
                        </span>
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                          Абсолютная точность
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-stone-500 leading-relaxed mb-10 flex-grow font-medium">
                  Премиальный индивидуальный пошив по вашим меркам.
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-stone-300 bg-stone-950/50 rounded-2xl p-6 border border-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] group-hover:border-stone-700">
                  <div className="group-hover:translate-x-1 transition-transform duration-300">
                    Посадка до миллиметра
                  </div>
                  <div className="group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    Премиум ткани
                  </div>
                  <div className="group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    3
                  </div>
                  <div className="group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    4
                  </div>
                </div>

                <a
                  href="#"
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 text-sm font-bold text-stone-900  hover:bg-stone-400  transition-all duration-300"
                >
                  Каталог Bespoke
                  {/* <iconify-icon icon="solar:arrow-right-linear" width="18" class="transform group-hover/btn:translate-x-1 transition-transform"></iconify-icon> */}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32 lg:px-8 border-t border-stone-200/40">
        <div className="mb-16">
          <h2 className="text-3xl font-semibold tracking-tighter text-stone-900 sm:text-5xl text-center">
            Инженерия эстетики
          </h2>
          <p className="mt-6 text-sm text-stone-500 max-w-2xl mx-auto text-center font-medium leading-relaxed">
            Мы импортируем только премиальные ткани из Италии и Англии,
            интегрируя высокие технологии в классическое искусство кроя.
            Украинское качество мирового уровня.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[minmax(240px,auto)] perspective-1000">
          <div className="md:col-span-2 row-span-2 relative overflow-hidden rounded-[2.5rem] bg-stone-900 text-white p-10 sm:p-14 border border-stone-800 flex flex-col justify-between group transform-3d hover-lift transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-crosshair">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-beige-300/10 blur-[100px] group-hover:bg-beige-300/20 group-hover:scale-150 transition-all duration-1000 ease-out"></div>
            <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-stone-500/20 blur-[100px] group-hover:translate-x-20 transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-30 mix-blend-overlay"></div>

            <div className="relative z-10 flex justify-between items-start">
              {/* <iconify-icon icon="solar:magic-stick-3-linear" width="40" className="text-beige-300 mb-12 transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-700"></iconify-icon> */}
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-md">
                Tech Fabric
              </span>
            </div>

            <div className="relative z-10 max-w-lg mt-auto">
              <h3 className="text-3xl sm:text-5xl font-semibold tracking-tighter mb-6 leading-[1.1]">
                Материалы, которые <br />
                дышат с вами
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed font-medium">
                Эластичный креп, невесомый шифон и высокотехнологичный бифлекс
                обеспечивают абсолютную посадку. Каждая молекула ткани работает
                на свободу вашего движения.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-stone-200 p-10 flex flex-col justify-center items-center text-center group hover-lift-reverse transition-all duration-700 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-beige-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-xl shadow-stone-900/10 transform group-hover:-translate-y-2 transition-transform duration-500">
              {/* <iconify-icon icon="solar:maximize-square-minimalistic-linear" width="28" stroke-width="1.5"></iconify-icon> */}
            </div>
            <span className="text-4xl font-semibold text-stone-900 tracking-tighter relative z-10">
              4-way
            </span>
            <span className="mt-3 text-xs font-bold text-stone-500 uppercase tracking-widest relative z-10">
              Stretch ткани
            </span>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-beige-100/60 border border-stone-200 p-10 flex flex-col justify-center items-center text-center group hover-lift transition-all duration-700 cursor-default">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-stone-900 shadow-xl shadow-stone-200/50 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              {/* <iconify-icon icon="solar:shield-star-linear" width="28" stroke-width="1.5"></iconify-icon> */}
            </div>
            <span className="text-4xl font-semibold text-stone-900 tracking-tighter relative z-10">
              Global
            </span>
            <span className="mt-3 text-xs font-bold text-stone-500 uppercase tracking-widest relative z-10">
              Стандарты
            </span>
          </div>

          <div className="md:col-span-3 overflow-hidden rounded-[2.5rem] bg-stone-900 text-white p-10 sm:p-12 relative flex flex-col sm:flex-row items-center justify-between group cursor-pointer hover:shadow-2xl hover:shadow-stone-900/20 transition-all duration-700 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,rgba(255,255,255,0.03)_49%,rgba(255,255,255,0.03)_51%,transparent_51%)] bg-[length:20px_20px] opacity-50"></div>

            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>

            <div className="relative z-10 text-center sm:text-left mb-6 sm:mb-0">
              <h3 className="text-2xl font-semibold tracking-tighter text-white">
                Взгляните на процесс создания
              </h3>
              <p className="mt-2 text-sm text-stone-400 font-medium">
                Бескомпромиссный подход киевских мастеров к каждому шву.
              </p>
            </div>
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white text-stone-900 group-hover:scale-110 group-hover:rotate-45 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              {/* <iconify-icon icon="solar:arrow-right-up-linear" width="24" stroke-width="1.5"></iconify-icon> */}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
