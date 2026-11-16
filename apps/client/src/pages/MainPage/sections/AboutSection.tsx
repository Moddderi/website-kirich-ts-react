import { useTranslation } from "react-i18next";
import { LuClock, LuCrown, LuEye, LuHeart, LuShirt, LuTarget } from "react-icons/lu";
import logoMini from "../../../assets/logo-mini.png";
import { Reveal } from "../../../components/shared/Reveal/Reveal";

export const AboutSection = () => {
  const { t } = useTranslation();

  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-32"
    >
      <Reveal>
        <div className="palette-original relative overflow-hidden rounded-4xl border border-white/10 bg-stone-900 p-7 text-white sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.10),transparent)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <div className="relative z-10">
            <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between lg:mb-14">
              <img
                src={logoMini}
                alt="K.I.RICH"
                width={80}
                height={80}
                loading="lazy"
                className="h-20 w-20 object-contain"
              />
              <span className="self-start rounded-full border border-white/25 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80">
                K.I.RICH SEWING STUDIO
              </span>
            </div>

            <div className="mb-12 max-w-4xl lg:mb-16">
              <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
                {t("main.engineeringTitle")}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-400 sm:text-base">
                {t("main.engineeringTagline")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
              {[
                { icon: LuTarget, title: "philosophyMissionTitle", desc: "philosophyMissionDesc" },
                { icon: LuEye, title: "philosophyVisionTitle", desc: "philosophyVisionDesc" },
              ].map(({ icon: Icon, title, desc }) => (
                <article key={title} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white">
                      <Icon size={19} strokeWidth={1.6} />
                    </span>
                    <h3 className="font-display text-2xl font-medium">
                      {t(`main.${title}`)}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-400">
                    {t(`main.${desc}`)}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12 border-t border-white/10 pt-10 lg:mt-16">
              <h3 className="mb-8 font-display text-2xl font-medium">
                {t("main.philosophyValuesTitle")}
              </h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {[
                  { icon: LuShirt, n: 1 },
                  { icon: LuClock, n: 2 },
                  { icon: LuHeart, n: 3 },
                ].map(({ icon: Icon, n }) => (
                  <div
                    key={n}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                  >
                    <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                      <Icon size={18} strokeWidth={1.6} />
                    </span>
                    <h4 className="mb-3 text-sm font-semibold text-white">
                      {t(`main.philosophyValue${n}Title`)}
                    </h4>
                    <p className="text-xs leading-relaxed text-stone-400">
                      {t(`main.philosophyValue${n}Desc`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 border-t border-white/10 pt-10 lg:mt-16">
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 text-white">
                  <LuCrown size={19} strokeWidth={1.6} />
                </span>
                <div>
                  <h3 className="mb-3 font-display text-2xl font-medium">
                    {t("main.philosophyManifestoTitle")}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-300 sm:text-base">
                    {t("main.philosophyManifestoDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
