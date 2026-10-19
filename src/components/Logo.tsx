import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
  tone = "dark",
  to = "/",
}: {
  className?: string;
  compact?: boolean;
  tone?: "dark" | "light";
  to?: string;
}) {
  const light = tone === "light";
  return (
    <Link
      to={to}
      aria-label="Ristorante Sì Chef — home"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <span
        className={cn(
          "relative grid size-11 place-items-center rounded-full border transition-all duration-500",
          light
            ? "border-cream/35 bg-cream/5 text-cream group-hover:border-ember/80"
            : "border-ink/20 bg-ink text-cream group-hover:border-flame/60",
        )}
      >
        <span className="font-display text-[1.45rem] leading-none font-semibold tracking-[-0.04em]">
          S
        </span>
        <span
          className={cn(
            "absolute -right-0.5 -bottom-0.5 size-2 rounded-full ring-2",
            light ? "bg-ember ring-ink" : "bg-ember ring-cream",
          )}
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.55rem] font-semibold tracking-[-0.03em]",
            light ? "text-cream" : "text-ink",
          )}
        >
          Sì Chef
        </span>
        {!compact && (
          <span
            className={cn(
              "mt-1.5 text-[0.48rem] font-extrabold tracking-[0.32em] uppercase",
              light ? "text-cream/55" : "text-ink/50",
            )}
          >
            Ristorante · Pizzeria
          </span>
        )}
      </span>
    </Link>
  );
}
