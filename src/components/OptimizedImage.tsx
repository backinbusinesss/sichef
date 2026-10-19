import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Immagine ottimizzata con blur-up placeholder.
 * Carica una versione a bassa qualità (LQIP) subito, poi la sostituisce con l'immagine completa.
 */
export function OptimizedImage({
  src,
  alt = "",
  className,
  priority = false,
  sizes,
  width,
  height,
  fill = false,
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Genera un placeholder SVG inline come LQIP
  const placeholder = useMemo(() => {
    const w = width ?? 40;
    const h = height ?? 30;
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'%3E%3Crect fill='%23f0ebe0' width='${w}' height='${h}'/%3E%3C/svg%3E`;
  }, [width, height]);

  useEffect(() => {
    if (!imgRef.current) return;
    if (imgRef.current.complete) {
      setIsLoaded(true);
    } else {
      const handleLoad = () => setIsLoaded(true);
      const handleError = () => setHasError(true);
      imgRef.current.addEventListener("load", handleLoad);
      imgRef.current.addEventListener("error", handleError);
      return () => {
        imgRef.current?.removeEventListener("load", handleLoad);
        imgRef.current?.removeEventListener("error", handleError);
      };
    }
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-cream-2",
        fill ? "absolute inset-0" : "block",
        className,
      )}
      style={fill ? { position: "absolute", inset: 0 } : undefined}
      aria-hidden={alt === ""}
    >
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-0" : "opacity-100",
          )}
          style={{ filter: "blur(20px) scale(1.1)" }}
        />
      )}

      <img
        ref={imgRef}
        src={hasError ? "/assets/img/placeholder.webp" : src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(
          "relative size-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError ? "grayscale" : "",
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        {...rest}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-cream-2 text-cream/30 text-[0.7rem]">
          Immagine non disponibile
        </div>
      )}
    </div>
  );
}

export function OptimizedPicture({
  src,
  alt = "",
  className,
  priority = false,
  sizes,
  width,
  height,
  webp = true,
}: {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  webp?: boolean;
}) {
  const webpSrc = webp && !src.endsWith(".svg") ? src.replace(/\.(jpg|jpeg|png)$/i, ".webp") : src;
  const fallbackSrc = webp && webpSrc !== src ? src : undefined;

  return (
    <picture className={cn(className)}>
      {webp && fallbackSrc && (
        <source type="image/webp" srcSet={webpSrc} sizes={sizes} />
      )}
      <OptimizedImage
        src={webp ? webpSrc : src}
        alt={alt}
        priority={priority}
        sizes={sizes}
        width={width}
        height={height}
      />
    </picture>
  );
}