import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  setCatalogLineQuantity,
  setOrderProgram,
  setTailoringCategory,
  toggleCatalogLine,
} from "../../store/tailoringSlice";
import { CurrencySwitcher } from "../../components/CurrencySwitcher/CurrencySwitcher";
import { ReadyAccessoriesPicker } from "../../components/ReadyAccessoriesPicker/ReadyAccessoriesPicker";
import { useReadyAccessories } from "../../hooks/useReadyAccessories";
import { useProductName } from "../../utils/useLocalizedProduct";
import {
  convertFromUah,
  formatConvertedPrice,
  clampLineQty,
  getTailoringProduct,
  listTailoringProducts,
  type TailoringCategory,
  type TailoringProgram,
} from "@project/shared";
import {
  useScheduleFormat,
  useTailoringEstimate,
} from "../../hooks/useTailoringEstimate";
import { LuCheck, LuMinus, LuPlus } from "react-icons/lu";

const CATEGORIES: TailoringCategory[] = ["competition", "training"];
const PROGRAMS: TailoringProgram[] = ["ST", "LAT"];

export const SelectTypePage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const category = useAppSelector((state) => state.tailoring.browseCategory);
  const orderProgram = useAppSelector((state) => state.tailoring.browseProgram);
  const lines = useAppSelector((state) => state.tailoring.lines);
  const currency = useAppSelector((state) => state.currency.code);
  const { estimate, formatRange, catalogLeadDays, workDaysTable } =
    useTailoringEstimate();
  const { selected: readySelected, totalDisplay: accessoriesTotal } =
    useReadyAccessories();
  const getProductName = useProductName();
  const schedule = useScheduleFormat();

  const products =
    category && orderProgram
      ? listTailoringProducts(category, orderProgram)
      : [];

  const countByCategory = useMemo(() => {
    const out: Record<TailoringCategory, number> = {
      competition: 0,
      training: 0,
    };
    for (const line of lines) {
      const p = getTailoringProduct(line.productId);
      if (p) out[p.category] += clampLineQty(line.quantity);
    }
    return out;
  }, [lines]);

  const countInBrowseProgram = (program: TailoringProgram) => {
    if (!category) return 0;
    let n = 0;
    for (const line of lines) {
      const p = getTailoringProduct(line.productId);
      if (p?.category === category && p.program === program) {
        n += clampLineQty(line.quantity);
      }
    }
    return n;
  };

  const priceFromUah = (fromUah: number) =>
    t("pricing.from", {
      price: formatConvertedPrice(convertFromUah(fromUah, currency), currency),
    });

  const productLabel = (productId: string) =>
    t(`selectType.catalog.${productId}`, {
      defaultValue: productId,
    });

  const leadForProduct = (
    productId: string,
    program: TailoringProgram,
    measurementType: (typeof products)[0]["measurementType"],
    fallbackMin: number,
    fallbackMax: number,
  ) => {
    if (productId === "competition.st.frock") {
      const p = getTailoringProduct(productId);
      if (p) return { min: p.leadDaysMin, max: p.leadDaysMax };
    }
    const synced = catalogLeadDays[productId];
    if (typeof synced === "number" && Number.isFinite(synced)) {
      return { min: synced, max: synced };
    }
    const fromNotionTable =
      workDaysTable?.[program]?.[measurementType];
    if (typeof fromNotionTable === "number" && Number.isFinite(fromNotionTable)) {
      return { min: fromNotionTable, max: fromNotionTable };
    }
    return { min: fallbackMin, max: fallbackMax };
  };

  const hasSelection = lines.length > 0;
  const canContinue = hasSelection;

  const lineSummaryLabel = (productId: string, qty: number) => {
    const product = getTailoringProduct(productId);
    const name = productLabel(productId);
    if (!product) {
      return qty > 1 ? `${name} ×${qty}` : name;
    }
    const kind = t(`selectType.category.${product.category}`);
    return qty > 1
      ? `${kind} · ${product.program} · ${name} ×${qty}`
      : `${kind} · ${product.program} · ${name}`;
  };

  return (
    <>
    <section className="animate-reveal-up pb-4">
      <div className="mx-auto max-w-7xl px-0 sm:px-6">
        <div className="mb-12 max-sm:mb-6 text-center max-w-2xl mx-auto animate-reveal-up [animation-delay:200ms]">
          <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent mb-6 max-sm:mb-3 inline-block">
            {t("selectType.stepLabel")}
          </span>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tighter text-stone-900 mb-6 max-sm:mb-3">
            {t("selectType.title")}
          </h1>
          <p className="text-sm sm:text-base font-medium text-stone-500 leading-relaxed">
            {t("selectType.description")}
          </p>
        </div>

        <div className="mx-auto mb-8 max-sm:mb-5 flex max-w-4xl justify-end max-sm:justify-center">
          <CurrencySwitcher />
        </div>

        <div className="mx-auto max-w-4xl mb-10 max-sm:mb-6">
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            {t("selectType.categoryTitle")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((value) => {
              const active = category === value;
              const cartCount = countByCategory[value];
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => dispatch(setTailoringCategory(value))}
                  className={`relative rounded-3xl border px-6 py-8 max-sm:px-5 max-sm:py-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg max-sm:hover:translate-y-0 ${
                    active
                      ? "border-accent bg-accent/5 ring-2 ring-accent ring-offset-2 ring-offset-beige-50 max-sm:ring-offset-0"
                      : "border-stone-200 bg-white hover:border-stone-400"
                  }`}
                >
                  {cartCount > 0 && (
                    <span
                      className="absolute right-4 top-4 flex min-h-7 min-w-7 items-center justify-center rounded-full bg-accent px-2 text-xs font-bold text-white shadow-md"
                      aria-label={t("selectType.cartBadge", { count: cartCount })}
                    >
                      {cartCount}
                    </span>
                  )}
                  <h2 className="text-xl font-semibold text-stone-900 pr-8">
                    {t(`selectType.category.${value}`)}
                  </h2>
                  <p className="mt-2 text-sm text-stone-500">
                    {t(`selectType.category.${value}Desc`)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Program */}
        {category && (
          <div className="mx-auto max-w-4xl mb-10 max-sm:mb-6">
            <p className="mb-3 max-sm:mb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-stone-400">
              {t("selectType.programTitle")}
            </p>
            <div
              role="radiogroup"
              aria-label={t("selectType.programTitle")}
              className="mx-auto grid max-w-md grid-cols-2 gap-1 rounded-full border border-stone-200 bg-white p-1 shadow-sm"
            >
              {PROGRAMS.map((value) => {
                const active = orderProgram === value;
                const progCount = countInBrowseProgram(value);
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => dispatch(setOrderProgram(value))}
                    className={`relative rounded-full px-3 py-3 text-[11px] font-semibold transition-all duration-300 sm:px-4 sm:text-xs ${
                      active
                        ? "bg-accent text-[#fff] shadow-md"
                        : "text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    {t(`selectType.program${value}`)}
                    {progCount > 0 && (
                      <span
                        className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                          active
                            ? "bg-white text-accent"
                            : "bg-accent text-white"
                        }`}
                      >
                        {progCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Products */}
        {category && orderProgram && (
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-widest text-stone-400">
              {t("selectType.productsTitle")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => {
                const selected = lines.some((l) => l.productId === product.id);
                const line = lines.find((l) => l.productId === product.id);
                return (
                  <div
                    key={product.id}
                    className={`flex flex-col rounded-3xl border bg-white transition-all duration-300 ${
                      selected
                        ? "border-accent shadow-md ring-1 ring-accent/30"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => dispatch(toggleCatalogLine(product.id))}
                      className="flex flex-1 flex-col p-5 text-left"
                    >
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <h3 className="min-w-0 flex-1 text-base font-semibold text-stone-900 text-balance sm:text-lg">
                          {productLabel(product.id)}
                        </h3>
                        {selected && (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white sm:h-8 sm:w-8">
                            <LuCheck size={16} />
                          </span>
                        )}
                      </div>
                      {product.studioOnly && (
                        <p className="mt-2 text-xs font-medium leading-snug text-accent">
                          {t("selectType.frockStudioOnly")}
                        </p>
                      )}
                      <p className="mt-3 text-sm font-semibold text-stone-900">
                        {priceFromUah(product.priceFromUah)}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-stone-500">
                        {(() => {
                          const lead = leadForProduct(
                            product.id,
                            product.program,
                            product.measurementType,
                            product.leadDaysMin,
                            product.leadDaysMax,
                          );
                          return t("selectType.leadTime", {
                            days: schedule.days(lead.min, lead.max),
                          });
                        })()}
                      </p>
                    </button>

                    {selected && line && !product.isKit && (
                      <div
                        className="flex items-center justify-between border-t border-stone-100 px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
                          {t("selectType.quantity")}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={t("selectType.quantityDec")}
                            disabled={line.quantity <= 1}
                            onClick={() =>
                              dispatch(
                                setCatalogLineQuantity({
                                  productId: product.id,
                                  quantity: line.quantity - 1,
                                }),
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-700 disabled:opacity-40"
                          >
                            <LuMinus size={14} />
                          </button>
                          <span className="min-w-[1.25rem] text-center text-sm font-bold text-stone-900">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={t("selectType.quantityInc")}
                            disabled={line.quantity >= 5}
                            onClick={() =>
                              dispatch(
                                setCatalogLineQuantity({
                                  productId: product.id,
                                  quantity: line.quantity + 1,
                                }),
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-700 disabled:opacity-40"
                          >
                            <LuPlus size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mx-auto mt-8 max-sm:mt-5 max-w-2xl text-center text-xs font-medium text-stone-400 leading-relaxed">
              {t("selectType.addMoreHint")}
            </p>
          </div>
        )}

        <ReadyAccessoriesPicker />

        <p className="mx-auto mt-8 max-sm:mt-4 max-w-2xl text-center text-xs font-medium text-stone-400 leading-relaxed">
          {t("selectType.programHint")}
        </p>
      </div>
    </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/70 bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1 max-sm:max-h-[5.5rem]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              {t("selectType.summaryTitle")}
            </p>
            {hasSelection || readySelected.length > 0 ? (
              <>
                <ul
                  className="mt-1 max-h-28 space-y-0.5 overflow-y-auto pr-1 max-sm:max-h-16"
                  aria-label={t("selectType.summaryTitle")}
                >
                  {lines.map((line) => (
                    <li
                      key={line.productId}
                      className="break-words text-sm font-semibold leading-snug text-stone-900 max-sm:text-xs"
                    >
                      {lineSummaryLabel(line.productId, line.quantity)}
                    </li>
                  ))}
                  {readySelected.map((line) => (
                    <li
                      key={`acc-${line.productId}`}
                      className="break-words text-sm font-semibold leading-snug text-stone-900 max-sm:text-xs"
                    >
                      {getProductName(line.product)}
                      {line.quantity > 1 ? ` ×${line.quantity}` : ""}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-sm font-semibold text-stone-900 max-sm:text-xs sm:mt-1.5">
                  <span className="font-medium text-stone-500">
                    {t("selectType.total")}{" "}
                    {formatRange(
                      estimate.priceFrom + accessoriesTotal,
                      estimate.priceTo + accessoriesTotal,
                    )}
                  </span>
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm font-medium text-stone-500">
                {t("selectType.summaryEmpty")}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={!canContinue}
            onClick={() => navigate("/individual-tailoring/step-2")}
            className="btn-ember w-full shrink-0 rounded-2xl px-8 py-3.5 text-sm font-semibold active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-4"
          >
            {t("selectType.continue")}
          </button>
        </div>
      </div>
    </>
  );
};