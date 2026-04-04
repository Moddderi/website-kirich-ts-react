import { CiSearch } from "react-icons/ci";
import { CiUser } from "react-icons/ci";
import { IoBagHandleOutline } from "react-icons/io5";

export const Header = () => {
  return (
    <>
      <div className="bg-stone-900 p-4 px-4 py-2.5 text-center relative overflow-hidden group">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] animate-[pulse_3s_linear_infinite] group-hover:bg-[length:300px_300px] transition-all duration-1000"></div>
        <p className="text-xs font-medium text-white tracking-widest relative z-10 uppercase  animate-reveal-up">
          Global Shipping. Створенно в Україні.
          <a
            href="#"
            className="underline underline-offset-4 decoration-stone-500 hover:decoration-white transition-colors ml-2"
          >
            Детальніше
          </a>
        </p>
      </div>

      <nav className="sticky top-0 z-50 border-b border-stone-200/50 bg-beige-50/80 backdrop-blur-3xl transition-all duration-500">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between  animate-reveal-up delay-100">
            <div className="flex-shrink-0">
              <a
                href="#"
                className="text-xl font-semibold tracking-tighter text-stone-900 flex items-baseline gap-2 group"
              >
                K.I.RICH
                <span className="text-xs font-medium text-stone-400 tracking-widest group-hover:text-stone-900 transition-colors duration-500">
                  POLTAVA
                </span>
              </a>
            </div>

            <div className="hidden md:flex md:items-center md:gap-10">
              <a
                href="#"
                className="relative text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors magnetic-link"
              >
                Женщинам
              </a>
              <a
                href="#"
                className="relative text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors magnetic-link"
              >
                Мужчинам
              </a>
              <a
                href="#"
                className="relative text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors magnetic-link"
              >
                Девочкам
              </a>
              <a
                href="#"
                className="relative text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors magnetic-link"
              >
                Мальчикам
              </a>
              <a
                href="#"
                className="relative text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors magnetic-link"
              >
                Аксессуары
              </a>
            </div>

            <div className="flex items-center gap-6">
              <button className="text-stone-400 hover:text-stone-900 transition-colors flex items-center transform hover:scale-110 hover:-rotate-3 duration-300">
                <CiSearch size={26} />
              </button>
              <button className="text-stone-400 hover:text-stone-900 transition-colors flex items-center transform hover:scale-110 hover:rotate-3 duration-300">
                <CiUser size={26} />
              </button>
              <button className="text-stone-400 hover:text-stone-900 transition-colors flex items-center relative transform hover:scale-110 duration-300 group">
                <IoBagHandleOutline size={26} />
                <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white ring-2 ring-beige-50 group-hover:scale-125 transition-transform duration-500">
                  2
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
