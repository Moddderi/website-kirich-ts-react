import { useState } from "react";
import type { Product } from "@project/shared";
import { getAccessorySizes } from "@project/shared";
import { useTranslation } from "react-i18next";
import { LuMinus, LuPlus } from "react-icons/lu";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { setReadyAccessoryQuantity } from "../../store/tailoringSlice";
import { useReadyAccessories } from "../../hooks/useReadyAccessories";
import { useFormattedPrice } from "../../hooks/useFormattedPrice";
import { useProductName } from "../../utils/useLocalizedProduct";
import { optimizeCloudinaryUrl } from "../../utils/cloudinary";
import { accessorySizeLabel } from "../../utils/accessorySizeLabel";

const qtyOf = (
  lines: { productId: string; quantity: number; size?: string | null }[],
  product: Product,
  size: string | null,
) =>
  lines.find(
    (line) =>
      line.productId === String(product.id) && (line.size ?? null) === size,
  )?.quantity ?? 0;

export const ReadyAccessoriesPicker = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const lines = useAppSelector((state) => state.tailoring.readyAccessories);
  const { products, isLoading } = useReadyAccessories();
  const formatPrice = useFormattedPrice();
  const getProductName = useProductName();
  const [pickedSize, setPickedSize] = useState<Record<string, string>>({});

  const setQty = (product: Product, quantity: number, size: string | null) => {
    dispatch(
      setReadyAccessoryQuantity({
        productId: String(product.id),
        quantity,
        size,
      }),
    );
  };

  return (
    <div className="mx-auto mt-12 max-w-4xl max-sm:mt-8">
      <p className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-accent">
        {t("selectType.readyAccessoriesTitle")}
      </p>
      <p className="mx-auto mb-5 max-w-2xl text-center text-xs font-medium leading-relaxed text-stone-400">
        {t("selectType.readyAccessoriesHint")}
      </p>

      {isLoading && products.length === 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-stone-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {products.map((product) => {
            const sizes = getAccessorySizes(product);
            const productId = String(product.id);
            const size = sizes
              ? (pickedSize[productId] && sizes.includes(pickedSize[productId])
                  ? pickedSize[productId]
                  : sizes[0])
              : null;
            const quantity = qtyOf(lines, product, size);
            const anySelected = lines.some((line) => line.productId === productId);
            const image = Array.isArray(product.imageUrl) ? product.imageUrl[0] : "";
            return (
              <div
                key={product.id}
                className={`rounded-3xl border bg-white p-3 transition-all ${
                  anySelected
                    ? "border-accent shadow-md ring-1 ring-accent/30"
                    : "border-stone-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-2xl bg-stone-100">
                    {image && (
                      <img
                        src={optimizeCloudinaryUrl(image, { width: 160 })}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {getProductName(product)}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-stone-500">
                      {formatPrice(Number(product.price))}
                      <span className="ml-2 font-medium text-stone-400">
                        {t("selectType.readyInStock")}
                      </span>
                    </p>
                  </div>
                  {quantity > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={t("selectType.quantityDec")}
                        onClick={() => setQty(product, quantity - 1, size)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-700"
                      >
                        <LuMinus size={14} />
                      </button>
                      <span className="min-w-[1.25rem] text-center text-sm font-bold text-stone-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={t("selectType.quantityInc")}
                        disabled={quantity >= 5}
                        onClick={() => setQty(product, quantity + 1, size)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-700 disabled:opacity-40"
                      >
                        <LuPlus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setQty(product, 1, size)}
                      className="shrink-0 rounded-full border border-stone-900 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-stone-900 transition-colors hover:bg-stone-900 hover:text-white"
                    >
                      {t("selectType.readyAdd")}
                    </button>
                  )}
                </div>
                {sizes && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {sizes.map((option) => {
                      const active = option === size;
                      const optionQty = qtyOf(lines, product, option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setPickedSize((prev) => ({ ...prev, [productId]: option }))
                          }
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold leading-snug transition-colors ${
                            active
                              ? "border-accent bg-accent text-white"
                              : "border-stone-200 text-stone-600 hover:border-stone-400"
                          }`}
                        >
                          {accessorySizeLabel(option, t)}
                          {optionQty > 0 && !active ? ` · ${optionQty}` : ""}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
