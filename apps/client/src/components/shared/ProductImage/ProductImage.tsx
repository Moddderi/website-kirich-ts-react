import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
  className?: string;
}

export const ProductImage = ({
  src,
  alt,
  loading = "lazy",
  className = "",
}: ProductImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative h-full w-full">
      {!isLoaded && (
        <div
          className="absolute inset-0 overflow-hidden bg-stone-200"
          aria-hidden="true"
        >
          <div className="image-shimmer absolute inset-0" />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </div>
  );
};
