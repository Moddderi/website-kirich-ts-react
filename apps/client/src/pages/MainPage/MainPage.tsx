import { CiGlobe } from "react-icons/ci";
import { FaPencilRuler } from "react-icons/fa";
import { FaPenRuler } from "react-icons/fa6";
import { BsPencilSquare } from "react-icons/bs";
import { IoTimeOutline, IoManOutline } from "react-icons/io5";
import { MdOutlineWorkspacePremium, MdOutlineStraighten } from "react-icons/md";
import { FiBox } from "react-icons/fi";
import {
  HiOutlineSquares2X2,
  HiOutlineEye,
  HiOutlineHeart,
  HiOutlineFlag,
} from "react-icons/hi2";
import { RiVipCrown2Line } from "react-icons/ri";
import { TbAward, TbShirt } from "react-icons/tb";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoMini from "../../assets/logo-mini.png";

export const MainPage = () => {
  const { t } = useTranslation();

  return (
    <main className="flex-grow">
      <section className="relative overflow-hidden pt-6 pb-32 sm:pt-14 sm:pb-48">
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
            {t("main.vanguardCollection")}
          </div>

          <h1 className=" animate-reveal-up delay-300 mx-auto max-w-5xl text-5xl font-semibold tracking-tighter text-stone-900 sm:text-7xl lg:text-8xl leading-[1.1]">
            {t("main.heroTitle1")} <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-stone-700 to-stone-400">
                {t("main.heroTitle2")}
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-beige-200/50 -z-10 -rotate-1 origin-left scale-x-0 animate-[shimmer_2s_forwards_1s] delay-700"></div>
            </span>
          </h1>

          <p className=" animate-reveal-up delay-500 mx-auto mt-8 max-w-2xl text-lg text-stone-500 leading-relaxed font-medium">
            {t("main.heroDescription")}
          </p>

          <div className=" animate-reveal-up delay-700 mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
            <Link
              to="/catalog"
              className="group relative w-full sm:w-auto rounded-xl bg-stone-900 px-8 py-4 text-sm font-semibold text-white shadow-2xl shadow-stone-900/30 hover:bg-stone-800 hover:-translate-y-1 transition-all duration-500 overflow-hidden flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <span className="relative z-10">{t("main.goToCollection")}</span>
              {/* <iconify-icon icon="solar:arrow-right-linear" width="18" stroke-width="1.5" className="relative z-10 transform group-hover:translate-x-2 transition-transform duration-500"></iconify-icon> */}
            </Link>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("about")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="group w-full sm:w-auto rounded-xl border border-stone-200/80 bg-white/40 backdrop-blur-md px-8 py-4 text-sm font-semibold text-stone-900 shadow-sm hover:border-stone-900 hover:bg-white transition-all duration-500 flex items-center justify-center gap-2"
            >
              {t("main.brandPhilosophy")}
              <div className="h-1.5 w-1.5 rounded-full bg-stone-300 group-hover:bg-stone-900 transition-colors duration-500 ml-1"></div>
            </a>
          </div>

          <div className="hidden lg:flex absolute top-1/4 -right-16 animate-float-complex items-center gap-4 rounded-3xl border border-white/60 bg-white/40 p-5 backdrop-blur-2xl shadow-[0_20px_40px_rgba(28,25,23,0.05)] w-72 text-left glass-reflection hover:bg-white/60 transition-all duration-500 z-20">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-lg shadow-stone-900/20 relative">
              <div className="absolute inset-0 rounded-2xl border border-white/20 animate-pulse-glow"></div>
              <FaPencilRuler size={20} color="white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-stone-900">
                {t("main.precisionTitle")}
              </p>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                {t("main.precisionDesc")}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex absolute bottom-1/4 -left-12 animate-float-reverse  items-center gap-4 rounded-3xl border border-white/60 bg-white/40 p-5 backdrop-blur-2xl shadow-[0_20px_40px_rgba(28,25,23,0.05)] w-64 text-left   hover:bg-white/60 transition-all duration-500 z-20 delay-300">
            <div className="flex h-12 w-12  items-center justify-center rounded-2xl bg-stone-500 text-stone-800 border border-white/80">
              <CiGlobe size={28} color="white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-stone-900">
                Poltava, Ukraine
              </p>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                {t("main.handmade")}
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
            <h2 className="text-3xl font-semibold tracking-tighter text-white sm:text-5xl">
              {t("main.orderArchitecture")}
            </h2>
            <p className="mt-6 text-sm text-stone-500 max-w-2xl mx-auto font-medium">
              {t("main.orderArchitectureDesc")}
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
                        {t("main.bespokeTitle")}
                      </h3>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="h-2 w-2 rounded-full bg-white relative">
                          <span className="absolute h-full w-full rounded-full bg-white opacity-40 animate-ping" />
                        </span>
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                          {t("main.absolutePrecision")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-stone-500 leading-relaxed mb-10 flex-grow font-medium">
                  {t("main.individualDesc")}
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-stone-300 bg-stone-950/50 rounded-2xl p-6 border border-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] group-hover:border-stone-700">
                  <div className="flex gap-2 group-hover:translate-x-1 transition-transform duration-300">
                    <FaPenRuler size={16} />
                    {t("main.fitToMm")}
                  </div>
                  <div className="flex gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    <MdOutlineWorkspacePremium size={18} />
                    {t("main.premiumFabrics")}
                  </div>
                  <div className="flex gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    <BsPencilSquare size={16} />
                    {t("main.uniqueDesign")}
                  </div>
                  <div className="flex gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    <IoTimeOutline size={18} />
                    {t("main.creationFrom14")}
                  </div>
                </div>

                <Link
                  to="/individual-tailoring"
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 text-sm font-bold text-stone-900  hover:bg-stone-400  transition-all duration-300"
                >
                  {t("main.tailoring")}
                  {/* <iconify-icon icon="solar:arrow-right-linear" width="18" class="transform group-hover/btn:translate-x-1 transition-transform"></iconify-icon> */}
                </Link>
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
                    <div className="h-16 w-16 rounded-2xl bg-stone-800 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 text-white shadow-sm ring-1 ring-white/10">
                      <TbShirt size={25} />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {t("main.readyProducts")}
                      </h3>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="h-2 w-2 rounded-full bg-white relative">
                          <span className="absolute h-full w-full rounded-full bg-white opacity-40 animate-ping" />
                        </span>
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                          {t("main.calibratedGrid")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-stone-500 leading-relaxed mb-10 flex-grow font-medium">
                  {t("main.readyDesc")}
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-stone-300 bg-stone-950/50 rounded-2xl p-6 border border-stone-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] group-hover:border-stone-700">
                  <div className="flex gap-2 group-hover:translate-x-1 transition-transform duration-300">
                    <FiBox size={18} className="shrink-0" />
                    {t("main.shippingIn24h")}
                  </div>
                  <div className="flex gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    <TbAward size={18} className="shrink-0" />
                    {t("main.premiumFabrics")}
                  </div>
                  <div className="flex gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    <HiOutlineSquares2X2 size={18} className="shrink-0" />
                    {t("main.wideAssortment")}
                  </div>
                  <div className="flex gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-100">
                    <MdOutlineStraighten size={18} className="shrink-0" />
                    {t("main.wideSizeGrid")}
                  </div>
                </div>

                <Link
                  to="/catalog"
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 text-sm font-bold text-stone-900  hover:bg-stone-400  transition-all duration-300"
                >
                  {t("main.goToCollection")}
                  {/* <iconify-icon icon="solar:arrow-right-linear" width="18" class="transform group-hover/btn:translate-x-1 transition-transform"></iconify-icon> */}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="mx-auto max-w-7xl px-6 py-32 lg:px-8 border-t border-stone-200/40"
      >
        <div className="relative overflow-hidden rounded-[2.5rem] bg-stone-900 text-white p-8 sm:p-12 lg:p-16 border border-stone-800 group">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-beige-300/10 blur-[100px] group-hover:bg-beige-300/20 group-hover:scale-150 transition-all duration-1000 ease-out" />
          <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-stone-500/20 blur-[100px] group-hover:translate-x-20 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-30 mix-blend-overlay" />

          <div className="relative z-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-10 lg:mb-14">
              <img
                src={logoMini}
                alt="K.I.RICH"
                className="h-20 w-20 object-contain"
              />
              <span className="self-start rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80 backdrop-blur-md">
                K.I.RICH SEWING STUDIO
              </span>
            </div>

            <div className="max-w-4xl mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter leading-[1.1] mb-4">
                {t("main.engineeringTitle")}
              </h2>
              <p className="text-sm sm:text-base text-stone-400 font-medium leading-relaxed">
                {t("main.engineeringTagline")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
              <article className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                    <HiOutlineFlag size={18} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {t("main.philosophyMissionTitle")}
                  </h3>
                </div>
                <p className="text-sm text-stone-400 leading-relaxed font-medium">
                  {t("main.philosophyMissionDesc")}
                </p>
              </article>

              <article className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                    <HiOutlineEye size={18} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {t("main.philosophyVisionTitle")}
                  </h3>
                </div>
                <p className="text-sm text-stone-400 leading-relaxed font-medium">
                  {t("main.philosophyVisionDesc")}
                </p>
              </article>
            </div>

            <div className="mt-12 lg:mt-16 pt-10 border-t border-white/10">
              <h3 className="text-lg font-semibold tracking-tight mb-8">
                {t("main.philosophyValuesTitle")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <IoManOutline size={18} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-3">
                    {t("main.philosophyValue1Title")}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-medium">
                    {t("main.philosophyValue1Desc")}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <IoTimeOutline size={18} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-3">
                    {t("main.philosophyValue2Title")}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-medium">
                    {t("main.philosophyValue2Desc")}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <HiOutlineHeart size={18} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-3">
                    {t("main.philosophyValue3Title")}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-medium">
                    {t("main.philosophyValue3Desc")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 lg:mt-16 pt-10 border-t border-white/10">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-beige-200/10 border border-beige-200/20 text-beige-200">
                  <RiVipCrown2Line size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight mb-4">
                    {t("main.philosophyManifestoTitle")}
                  </h3>
                  <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-medium">
                    {t("main.philosophyManifestoDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
