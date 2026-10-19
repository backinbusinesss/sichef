import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/lib/types";

export function GalleryGrid({
  images,
  lightbox = false,
  className,
}: {
  images: GalleryImage[];
  lightbox?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const move = useCallback(
    (direction: number) => {
      setActive((current) => {
        if (current === null) return current;
        return (current + direction + images.length) % images.length;
      });
    },
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, move]);

  return (
    <>
      <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4", className)}>
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => lightbox && setActive(index)}
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-cream-2 text-left",
              index % 7 === 0 && "md:col-span-2 md:row-span-2",
              index % 7 === 3 && "md:row-span-2",
              !lightbox && "cursor-default",
            )}
          >
            <img
              src={image.url}
              alt={image.caption || "Ristorante Sì Chef"}
              loading="lazy"
              className={cn(
                "size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)]",
                index % 7 === 0 ? "aspect-square" : "aspect-[4/3] md:aspect-square",
                lightbox && "group-hover:scale-[1.04]",
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
              <span className="text-[0.68rem] font-semibold text-cream/85">{image.caption}</span>
              {lightbox && (
                <span className="grid size-7 place-items-center rounded-full border border-cream/30 bg-ink/30 text-cream opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ZoomIn className="size-3" />
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-md"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={close}
            className="absolute top-5 right-5 grid size-11 place-items-center rounded-full border border-cream/20 text-cream/80 hover:border-cream/60 hover:text-cream"
            aria-label="Chiudi"
          >
            <X className="size-5" />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              move(-1);
            }}
            className="absolute left-3 grid size-11 place-items-center rounded-full border border-cream/20 text-cream/80 hover:border-cream/60 md:left-8"
            aria-label="Immagine precedente"
          >
            <ChevronLeft className="size-5" />
          </button>
          <figure onClick={(event) => event.stopPropagation()} className="max-h-[86svh] max-w-6xl">
            <img
              src={images[active].url}
              alt={images[active].caption}
              className="max-h-[78svh] w-auto max-w-full rounded-2xl object-contain"
            />
            <figcaption className="mt-4 text-center text-[0.75rem] tracking-wide text-cream/55">
              {images[active].caption}
            </figcaption>
          </figure>
          <button
            onClick={(event) => {
              event.stopPropagation();
              move(1);
            }}
            className="absolute right-3 grid size-11 place-items-center rounded-full border border-cream/20 text-cream/80 hover:border-cream/60 md:right-8"
            aria-label="Immagine successiva"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </>
  );
}
