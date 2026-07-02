import type { Product } from "@project/shared";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { toggleFavorite, selectIsFavorite } from "../../store/favoriteSlice";
import { optimizeCloudinaryUrl } from "../../utils/cloudinary";
import { ProductImage } from "../shared/ProductImage/ProductImage";

import { IoHeart, IoHeartOutline } from "react-icons/io5";

interface ProductCardProps {
  product: Product;
  imageLoading?: "eager" | "lazy";
  enterDelayMs?: number;
}

export const ProductCard = ({
  product,
  imageLoading = "lazy",
  enterDelayMs = 0,
}: ProductCardProps) => {
  const dispatch = useAppDispatch();

  const isFavorite = useAppSelector(selectIsFavorite(product.id));
  const productId = product.id || product.product_code;

  const defaultImage = optimizeCloudinaryUrl(
    "https://res.cloudinary.com/dqe2odzsc/image/upload/default.jpg",
  );

  const images = Array.isArray(product.imageUrl) ? product.imageUrl : [];
  const displayImages = (images.length > 0 ? images : [defaultImage]).map(
    (url) => optimizeCloudinaryUrl(url),
  );

  const handleToggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite(product));
  };

  return (
    <Link
      to={`/catalog/${productId}`}
      className="product-card-enter group relative flex flex-col cursor-pointer"
      style={{ animationDelay: `${enterDelayMs}ms` }}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-4xl bg-stone-200 border border-stone-200/60">
        <div className="absolute inset-0 overflow-hidden">
          <ProductImage
            src={displayImages[0]}
            alt={product.name}
            loading={imageLoading}
            className={`scale-100 group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${
              displayImages.length > 1 ? "group-hover:opacity-0" : ""
            }`}
          />

          {displayImages.length > 1 && displayImages[1] !== defaultImage && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <ProductImage
                src={displayImages[1]}
                alt={`${product.name} - ракурс 2`}
                loading="lazy"
                className="scale-100 group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 backdrop-blur-[2px]"></div>

        <div className="absolute inset-x-5 bottom-5 z-20 translate-y-8 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleToggleFavorite}
            className={`w-full rounded-xl px-5 py-3 text-xs font-semibold uppercase tracking-widest shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${
              isFavorite
                ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                : "bg-stone-900 text-white hover:bg-stone-800"
            }`}
          >
            {isFavorite ? (
              <>
                <IoHeart size={16} className="text-red-500" />
                Видалити
              </>
            ) : (
              <>
                <IoHeartOutline size={16} />
                Вподобати
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-sm font-semibold tracking-tight text-stone-900 group-hover:text-stone-500 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm font-semibold text-stone-900 whitespace-nowrap">
            {product.price.toLocaleString()} ₴
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest border-b border-stone-300 border-dashed">
            {product.sub_type}
          </span>
        </div>
      </div>
    </Link>
  );
};
