import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/lib/hooks";

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span" | "header";
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <Tag
      ref={ref as never}
      className={cn("transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]", className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

/** Titolo editoriale con parole che entrano in sequenza. */
export function SplitHeading({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={cn("inline-flex flex-wrap gap-x-[0.28em] gap-y-1", className)}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="overflow-hidden py-[0.06em]">
          <span
            className="inline-block animate-[rise_0.9s_cubic-bezier(0.16,1,0.3,1)_both]"
            style={{ animationDelay: `${delay + index * 55}ms` }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

export function useMounted(delay = 0) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);
  return mounted;
}

export function SectionHeading({
  eyebrow,
  title,
  italic,
  description,
  align = "left",
  action,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
      )}
    >
      <Reveal className="max-w-2xl">
        <span className={cn("eyebrow", dark && "eyebrow-light")}>{eyebrow}</span>
        <h2 className="mt-4 text-[clamp(2.3rem,5.4vw,4.6rem)]">
          {title}
          {italic && (
            <>
              {" "}
              <span className={cn("display-italic", dark ? "text-ember" : "text-flame")}>{italic}</span>
            </>
          )}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-5 max-w-xl text-[0.98rem] leading-relaxed",
              dark ? "text-cream/55" : "text-ink/55",
            )}
          >
            {description}
          </p>
        )}
      </Reveal>
      {action && <Reveal delay={120}>{action}</Reveal>}
    </div>
  );
}
