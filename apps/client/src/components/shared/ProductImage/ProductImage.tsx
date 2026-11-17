import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
}

export const ProductImage = ({
  src,
  alt,
  loading = "lazy",
  fetchPriority = "auto",
  className = "",
}: ProductImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative h-full w-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-stone-200" aria-hidden="true" />
      )}

      <img
        ref={(node) => {
          if (node?.complete && node.naturalWidth > 0) setIsLoaded(true);
        }}
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={loading === "eager" ? "sync" : "async"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </div>
  );
};
