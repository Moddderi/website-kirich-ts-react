export const ProductCard = () => {
  return (
    <div className="group relative flex flex-col cursor-pointer opacity-0 animate-reveal-up delay-100">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-stone-200 border border-stone-200/60">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="src/assets/b1.jpg"
            alt="Силуэт Aria"
            className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
          />
        </div>

        <div className="absolute top-5 left-5 z-20 flex gap-2">
          <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-stone-900 shadow-sm border border-stone-200">
            База
          </span>
        </div>

        <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 backdrop-blur-[2px]"></div>
        <div className="absolute inset-x-5 bottom-5 z-20 translate-y-8 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button className="w-full rounded-xl bg-stone-900 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-xl hover:bg-stone-800 transition-colors duration-300 active:scale-95 flex items-center justify-center gap-2">
            {/* <iconify-icon icon="solar:ruler-linear" width="16"></iconify-icon> */}
            Додати в кошик
          </button>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-sm font-semibold tracking-tight text-stone-900 group-hover:text-stone-500 transition-colors">
            Силуэт "Aria" Латина
          </h3>
          <p className="text-sm font-semibold text-stone-900 whitespace-nowrap">
            от 15 500 ₴
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest border-b border-stone-300 border-dashed">
            По меркам
          </span>
        </div>
      </div>
    </div>
  );
};
