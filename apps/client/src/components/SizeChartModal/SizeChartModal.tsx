import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoMdClose } from "react-icons/io";
import { Portal } from "../shared/Portal/Portal";
import {
  KIDS_SIZE_CHART,
  MEN_SIZE_CHART,
  getSizeGroup,
  type SizeGroup,
} from "../../constants/sizeCharts";

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize?: string;
  activeGroup?: SizeGroup;
}

export const SizeChartModal = ({
  isOpen,
  onClose,
  selectedSize,
  activeGroup,
}: SizeChartModalProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SizeGroup>(
    activeGroup ?? getSizeGroup(selectedSize ?? "M"),
  );

  useEffect(() => {
    if (!isOpen) return;
    if (activeGroup) {
      setActiveTab(activeGroup);
      return;
    }
    if (selectedSize) {
      setActiveTab(getSizeGroup(selectedSize));
    }
  }, [isOpen, activeGroup, selectedSize]);

  if (!isOpen) return null;

  const rows = activeTab === "men" ? MEN_SIZE_CHART : KIDS_SIZE_CHART;

  return (
    <Portal>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="relative bg-stone-900 rounded-4xl sm:rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-10 shadow-2xl border border-stone-700/60 max-h-[90vh] overflow-y-auto animate-reveal-up z-10">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <IoMdClose size={22} />
          </button>

          <div className="text-center mb-8 pr-8">
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white uppercase">
              {t("productPage.sizeChartTitle")}
            </h3>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
              {activeTab === "men"
                ? t("productPage.sizeChartMen")
                : t("productPage.sizeChartKids")}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center rounded-full border border-stone-700 bg-stone-800/80 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("men")}
                className={`rounded-full px-4 sm:px-5 py-2 text-[11px] font-semibold uppercase tracking-widest transition-all ${
                  activeTab === "men"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                {t("productPage.sizeChartMen")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("kids")}
                className={`rounded-full px-4 sm:px-5 py-2 text-[11px] font-semibold uppercase tracking-widest transition-all ${
                  activeTab === "kids"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                {t("productPage.sizeChartKids")}
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-stone-200/95 overflow-hidden border border-stone-300/40">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-center text-sm text-stone-800 border-collapse">
                <thead>
                  <tr className="border-b border-stone-800/80 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-stone-800">
                    <th className="py-4 px-2 sm:px-3 border-r border-stone-800/70">
                      {t("productPage.sizeChartSize")}
                    </th>
                    <th className="py-4 px-2 sm:px-3 border-r border-stone-800/70">
                      {t("productPage.sizeChartChest")}
                    </th>
                    <th className="py-4 px-2 sm:px-3 border-r border-stone-800/70">
                      {t("productPage.sizeChartWaist")}
                    </th>
                    <th className="py-4 px-2 sm:px-3">
                      {t("productPage.sizeChartHips")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isSelected = selectedSize === row.size;

                    return (
                      <tr
                        key={row.size}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-white font-semibold text-stone-900"
                            : "hover:bg-white/50"
                        }`}
                      >
                        <td className="py-3 sm:py-3.5 px-2 sm:px-3 border-r border-stone-800/40 font-bold text-stone-900">
                          {row.size}
                        </td>
                        <td className="py-3 sm:py-3.5 px-2 sm:px-3 border-r border-stone-800/40">
                          {row.chest}
                        </td>
                        <td className="py-3 sm:py-3.5 px-2 sm:px-3 border-r border-stone-800/40">
                          {row.waist}
                        </td>
                        <td className="py-3 sm:py-3.5 px-2 sm:px-3">
                          {row.hips}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {activeTab === "kids" && (
            <p className="mt-4 text-center text-[11px] text-stone-400 font-medium">
              {t("productPage.sizeChartKidsHint")}
            </p>
          )}

          <p className="mt-6 text-xs text-stone-400 leading-relaxed text-center sm:text-left">
            {t("productPage.sizeChartNote")}
          </p>
        </div>
      </div>
    </Portal>
  );
};
