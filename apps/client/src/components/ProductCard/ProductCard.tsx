import { buildShopProductDefaultImageUrl, type Product } from "@project/shared";
import { useCloudinaryCloud } from "../../hooks/useCloudinaryCloud";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchProduct } from "../../api/productQueries";
import { loadProductPage } from "../../routes/lazyPages";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { toggleFavorite, selectIsFavorite } from "../../store/favoriteSlice";
import { optimizeCloudinaryUrl } from "../../utils/cloudinary";
import { ProductImage } from "../shared/ProductImage/ProductImage";
import { useProductName } from "../../utils/useLocalizedProduct";
import { useFormattedPrice } from "../../hooks/useFormattedPrice";

import { useTranslation } from "react-i18next";
import { LuHeart } from "react-icons/lu";

interface ProductCardProps {
  product: Product;
  imageLoading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  enterDelayMs?: number;
}

export const ProductCard = ({
  product,
  imageLoading = "lazy",
  fetchPriority = "auto",
  enterDelayMs = 0,
}: ProductCardProps) => {
  const cloudinaryCloud = useCloudinaryCloud();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const getProductName = useProductName();
  const formatPrice = useFormattedPrice();

  const isFavorite = useAppSelector(selectIsFavorite(product.id));
  const localizedName = getProductName(product);
  const productId = product.id || product.product_code;

  // Warm up the product page chunk + data as soon as the user shows intent
  // (hover / focus / touch), so the click feels instant.
  const queryClient = useQueryClient();
  const warmUp = () => {
    void loadProductPage();
    void prefetchProduct(queryClient, productId);
  };

  const defaultImage = optimizeCloudinaryUrl(
    buildShopProductDefaultImageUrl(cloudinaryCloud),
  );

  const images = Array.isArray(product.imageUrl) ? product.imageUrl : [];
  const displayImages = (images.length > 0 ? images : [defaultImage]).map(
    (url) => optimizeCloudinaryUrl(url, { width: 640 }),
  );

  const handleToggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite(product));
  };

  return (
    <Link
      to={`/catalog/${productId}`}
      onMouseEnter={warmUp}
      onFocus={warmUp}
      onTouchStart={warmUp}
      className="group relative flex h-full flex-col cursor-pointer"
      style={enterDelayMs ? { animationDelay: `${enterDelayMs}ms` } : undefined}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-4xl border border-stone-900/10 bg-stone-900/[0.04]">
        <div className="absolute inset-0 overflow-hidden">
          <ProductImage
            src={displayImages[0]}
            alt={localizedName}
            loading={imageLoading}
            fetchPriority={fetchPriority}
            className={`scale-100 transition-transform duration-700 ease-out group-hover:scale-105 ${
              displayImages.length > 1 ? "group-hover:opacity-0" : ""
            }`}
          />

          {displayImages.length > 1 && displayImages[1] !== defaultImage && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <ProductImage
                src={displayImages[1]}
                alt={`${localizedName} - ${t("productCard.angle", { n: 2 })}`}
                loading="lazy"
                className="scale-100 group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? t("productCard.remove") : t("productCard.like")}
          className={`absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-colors ${
            isFavorite
              ? "border-accent/40 bg-accent/20 text-accent"
              : "border-stone-900/15 bg-beige-50/70 text-stone-700 hover:text-stone-900"
          }`}
        >
          <LuHeart size={16} className={isFavorite ? "fill-current" : ""} />
        </button>
      </div>

      <div className="mt-5">
        <h3 className="line-clamp-2 min-h-16 font-display text-2xl font-medium leading-8 tracking-tight text-stone-900">
          {localizedName}
        </h3>
        <p className="mt-1 text-sm font-semibold text-stone-500">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
};
