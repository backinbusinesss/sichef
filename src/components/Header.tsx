import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, CalendarCheck, Phone, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { cn, scrollToId } from "@/lib/utils";
import { useLockBody, useScrollProgress } from "@/lib/hooks";
import { useContent } from "@/lib/content";

const LINKS = [
  { label: "Chi siamo", to: "/chi-siamo" },
  { label: "Menu", to: "/menu" },
  { label: "Pranzo", to: "/menu-pranzo" },
  { label: "Eventi", to: "/eventi" },
  { label: "Fedeltà", to: "/fedelta" },
  { label: "Contatti", to: "/contatti" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { scrolled } = useScrollProgress();
  const location = useLocation();
  const { content } = useContent();
  const phone = content?.settings.venue?.phone ?? "0331 519111";
  const isHome = location.pathname === "/";
  const solid = !isHome || scrolled;

  useLockBody(open);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const goHomeSection = (id: string) => {
    setOpen(false);
    if (!isHome) {
      window.location.href = `/#${id}`;
      return;
    }
    scrollToId(id);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid ? "glass-nav py-2.5 shadow-[0_10px_40px_-30px_rgba(20,37,30,.45)]" : "py-4",
        )}
      >
        <div className="shell flex items-center justify-between gap-5">
          <Logo compact={scrolled} tone={solid ? "dark" : "light"} />

          <nav className="hidden items-center gap-5 xl:flex" aria-label="Navigazione principale">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "link-underline text-[0.65rem] font-extrabold tracking-[0.16em] uppercase transition-colors",
                  solid
                    ? "text-ink/60 hover:text-ink"
                    : "text-cream/70 hover:text-cream",
                  location.pathname === link.to && (solid ? "text-flame" : "text-ember"),
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className={cn(
                "grid size-10 place-items-center rounded-full border transition-colors",
                solid
                  ? "border-ink/15 text-ink/65 hover:border-flame/50 hover:text-flame"
                  : "border-cream/25 text-cream/80 hover:border-ember/70 hover:text-ember",
              )}
              aria-label={`Chiama ${phone}`}
            >
              <Phone className="size-3.5" />
            </a>
            <Link
              to="/ordina"
              className={cn(
                "btn btn-sm",
                solid ? "btn-ghost" : "btn-ghost-light",
              )}
            >
              <ShoppingBag className="size-3.5" />
              Ordina
            </Link>
            <Link to="/prenota" className="btn btn-clay btn-sm">
              <CalendarCheck className="size-3.5" />
              Prenota
            </Link>
          </div>

          <button
            onClick={() => setOpen((value) => !value)}
            className={cn(
              "grid size-11 place-items-center rounded-full border transition-colors xl:hidden",
              solid
                ? "border-ink/15 text-ink"
                : "border-cream/25 text-cream",
            )}
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink text-cream transition-all duration-500 xl:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex h-full flex-col justify-between px-6 pt-28 pb-9">
          <nav className="flex flex-col gap-0.5">
            {LINKS.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between border-b border-cream/10 py-3.5 text-left transition-all"
                style={{
                  transitionDelay: `${index * 35}ms`,
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(12px)",
                }}
              >
                <span className="font-display text-3xl">{link.label}</span>
                <span className="text-[0.58rem] tracking-[0.2em] text-cream/35">
                  0{index + 1}
                </span>
              </Link>
            ))}
            <button
              onClick={() => goHomeSection("galleria")}
              className="flex items-center justify-between border-b border-cream/10 py-3.5 text-left"
            >
              <span className="font-display text-3xl">Galleria</span>
              <span className="text-[0.58rem] tracking-[0.2em] text-cream/35">07</span>
            </button>
          </nav>

          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <Link to="/prenota" onClick={() => setOpen(false)} className="btn btn-clay w-full">
                <CalendarCheck className="size-4" />
                Prenota
              </Link>
              <Link to="/ordina" onClick={() => setOpen(false)} className="btn btn-gold w-full">
                <ShoppingBag className="size-4" />
                Ordina
              </Link>
            </div>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn btn-ghost-light w-full">
              <Phone className="size-4" />
              {phone}
            </a>
            <a
              href={content?.settings.venue?.maps}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 pt-2 text-[0.62rem] tracking-[0.16em] text-cream/45 uppercase"
            >
              Via S. Clemente 151, Cerro Maggiore
              <ArrowUpRight className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
