import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  italic,
  description,
  image = "/assets/img/table.webp",
  crumb,
  children,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  description?: string;
  image?: string;
  crumb?: string;
  children?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink pt-24 text-cream">
      <img
        src={image}
        alt=""
        className="absolute inset-0 size-full object-cover opacity-35"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(197,154,82,.18),transparent_55%)]" />
      <div
        className={cn(
          "shell relative flex min-h-[24rem] flex-col justify-end pb-12 md:min-h-[30rem] md:pb-16",
          align === "center" && "items-center text-center",
        )}
      >
        <nav className="mb-10 flex items-center gap-2 text-[0.58rem] font-bold tracking-[0.2em] text-cream/45 uppercase">
          <Link to="/" className="hover:text-cream">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-ember">{crumb ?? title}</span>
        </nav>
        <span className="eyebrow eyebrow-light">{eyebrow}</span>
        <h1 className="mt-5 max-w-4xl text-[clamp(2.8rem,7vw,6rem)]">
          {title}
          {italic && (
            <>
              {" "}
              <span className="display-italic text-ember">{italic}</span>
            </>
          )}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-6 max-w-2xl text-[0.95rem] leading-relaxed text-cream/60",
              align === "center" && "mx-auto",
            )}
          >
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
