import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  Clock3,
} from "lucide-react";
import { Logo } from "./Logo";
import { useContent } from "@/lib/content";

export function Footer() {
  const { content } = useContent();
  const venue = content?.settings.venue;
  const hours = content?.hours ?? [];
  const year = new Date().getFullYear();

  const hourLabel = (h: (typeof hours)[number]) => {
    if (h.isClosed) return "Chiuso";
    const lunch = h.lunchOpen && h.lunchClose ? `${h.lunchOpen}–${h.lunchClose}` : null;
    const dinner = h.dinnerOpen && h.dinnerClose ? `${h.dinnerOpen}–${h.dinnerClose}` : null;
    return [lunch, dinner].filter(Boolean).join(" · ");
  };

  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-52 left-1/2 h-96 w-[75rem] -translate-x-1/2 rounded-full bg-flame/15 blur-[140px]"
      />
      <div className="shell relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo tone="light" />
            <p className="mt-6 max-w-sm text-[0.9rem] leading-relaxed text-cream/60">
              {venue?.claim ??
                "La tradizione, servita con il sorriso. Cucina italiana e pizza artigianale a Cerro Maggiore."}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              {venue?.instagram && (
                <a
                  href={venue.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-10 place-items-center rounded-full border border-cream/15 text-cream/65 transition-all hover:-translate-y-0.5 hover:border-ember/60 hover:text-ember"
                  aria-label="Instagram"
                >
                  <Instagram className="size-3.5" />
                </a>
              )}
              {venue?.facebook && (
                <a
                  href={venue.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-10 place-items-center rounded-full border border-cream/15 text-cream/65 transition-all hover:-translate-y-0.5 hover:border-ember/60 hover:text-ember"
                  aria-label="Facebook"
                >
                  <Facebook className="size-3.5" />
                </a>
              )}
              {venue?.whatsapp && (
                <a
                  href={`https://wa.me/${venue.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost-light btn-sm"
                >
                  WhatsApp
                  <ArrowUpRight className="size-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[0.58rem] font-extrabold tracking-[0.24em] text-cream/40 uppercase">
              Esplora
            </h3>
            <ul className="mt-5 space-y-2.5 text-[0.82rem] text-cream/70">
              {[
                ["/chi-siamo", "Chi siamo"],
                ["/menu", "Il nostro menu"],
                ["/menu-pranzo", "Menu pranzo"],
                ["/ordina", "Ordina online"],
                ["/eventi", "Eventi e cerimonie"],
                ["/fedelta", "Programma fedeltà"],
                ["/galleria", "Galleria"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="link-underline hover:text-cream">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="flex items-center gap-2 text-[0.58rem] font-extrabold tracking-[0.24em] text-cream/40 uppercase">
              <Clock3 className="size-3" />
              Orari
            </h3>
            <ul className="mt-5 space-y-2 text-[0.76rem]">
              {hours.map((h) => (
                <li key={h.dayOfWeek} className="flex flex-col gap-0.5">
                  <span className="font-semibold text-cream/80">{h.label}</span>
                  <span className="text-cream/45 tabular-nums">{hourLabel(h)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[0.58rem] font-extrabold tracking-[0.24em] text-cream/40 uppercase">
              Dove siamo
            </h3>
            <ul className="mt-5 space-y-4 text-[0.82rem] text-cream/70">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-ember" />
                <a href={venue?.maps} target="_blank" rel="noreferrer" className="link-underline">
                  {venue?.address ?? "Via S. Clemente 151, 20023 Cerro Maggiore (MI)"}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-ember" />
                <a href={`tel:${(venue?.phone ?? "").replace(/\s/g, "")}`} className="link-underline">
                  {venue?.phone ?? "0331 519111"}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-ember" />
                <a href={`mailto:${venue?.email}`} className="link-underline break-all">
                  {venue?.email ?? "ristorantesichef@gmail.com"}
                </a>
              </li>
            </ul>
            <p className="mt-5 text-[0.68rem] leading-relaxed text-cream/35">
              Coperto {venue?.coperto ?? "2,00 €"}. {venue?.paymentNote}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/10 pt-6 text-[0.62rem] tracking-wide text-cream/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Ristorante Sì Chef · Cerro Maggiore (MI)</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy" className="link-underline hover:text-cream/60">
              Privacy & cookie
            </Link>
            <Link to="/prenota" className="link-underline hover:text-cream/60">
              Prenotazioni
            </Link>
            <Link to="/admin" className="link-underline text-cream/25 hover:text-cream/60">
              Area riservata
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
