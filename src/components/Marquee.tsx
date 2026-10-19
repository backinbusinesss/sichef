import { cn } from "@/lib/utils";

export function Marquee({
  items,
  className,
  slow = false,
  reverse = false,
}: {
  items: string[];
  className?: string;
  slow?: boolean;
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div className={cn("relative flex overflow-hidden py-4 select-none", className)}>
      <div
        className={cn(
          "flex w-max shrink-0 items-center gap-10 pr-10",
          slow ? "animate-marquee-slow" : "animate-marquee",
        )}
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {doubled.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            <span className="font-display text-[clamp(1.6rem,4vw,3rem)] font-light tracking-[-0.02em] whitespace-nowrap">
              {item}
            </span>
            <span className="size-1.5 rotate-45 bg-flame" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}
