import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoMdClose } from "react-icons/io";
import { Portal } from "../shared/Portal/Portal";
import { FULL_COLOR_PALETTE } from "../../constants/colorPalette";

interface ColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ColorPaletteModal = ({
  isOpen,
  onClose,
}: ColorPaletteModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-4xl sm:rounded-[2.5rem] bg-stone-900 p-6 sm:p-10 shadow-2xl border border-stone-700/60 animate-reveal-up">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <IoMdClose size={22} />
          </button>

          <div className="text-center mb-8 pr-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400 mb-3">
              K.I.RICH
            </p>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {t("productPage.paletteTitle")}
            </h3>
            <p className="mt-3 text-sm font-medium text-stone-400 leading-relaxed max-w-sm mx-auto">
              {t("productPage.paletteSubtitle")}
            </p>
          </div>

          <div className="rounded-3xl bg-stone-200/95 border border-stone-300/40 p-5 sm:p-6">
            <div className="grid grid-cols-4 gap-x-3 gap-y-4 place-items-center">
              {FULL_COLOR_PALETTE.map((color) => (
                <div
                  key={color.id}
                  className="group flex flex-col items-center gap-1.5"
                  title={t(`productPage.paletteColors.${color.id}`)}
                >
                  <span
                    className={`h-11 w-11 sm:h-12 sm:w-12 rounded-full shadow-inner ring-1 ring-stone-900/15 transition-transform duration-300 group-hover:scale-110 ${
                      color.id === "white" || color.id === "milky" || color.id === "butter" || color.id === "dove"
                        ? "ring-stone-400/40"
                        : ""
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[9px] font-medium text-stone-600 text-center leading-tight max-w-16 truncate">
                    {t(`productPage.paletteColors.${color.id}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-stone-700 bg-stone-800/60 p-5 sm:p-6 text-center">
            <p className="text-sm font-medium text-stone-300 leading-relaxed">
              {t("productPage.paletteCustomNote")}
            </p>

            <Link
              to="/individual-tailoring"
              onClick={onClose}
              className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-xs font-semibold uppercase tracking-widest text-stone-900 shadow-lg hover:bg-stone-200 transition-all duration-300 active:scale-95"
            >
              {t("productPage.paletteCustomCta")}
            </Link>
          </div>
        </div>
      </div>
    </Portal>
  );
};
