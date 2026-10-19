import { Link } from "react-router-dom";
import { ArrowUpRight, Car, Clock3, Mail, MapPin, Phone, Wifi, UtensilsCrossed } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useContent } from "@/lib/content";

export function LocationSection() {
  const { content } = useContent();
  const venue = content?.settings.venue;
  const hours = content?.hours ?? [];

  const hourLabel = (h: (typeof hours)[number]) => {
    if (h.isClosed) return "Chiuso";
    const lunch = h.lunchOpen && h.lunchClose ? `${h.lunchOpen}–${h.lunchClose}` : null;
    const dinner = h.dinnerOpen && h.dinnerClose ? `${h.dinnerOpen}–${h.dinnerClose}` : null;
    return [lunch, dinner].filter(Boolean).join(" / ");
  };

  return (
    <section id="dove-siamo" className="bg-cream py-20 md:py-28">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow">Dove siamo</span>
            <h2 className="mt-5 text-[clamp(2.4rem,5.2vw,4.6rem)]">
              A Cerro Maggiore,
              <br />
              <span className="display-italic text-flame">facile da raggiungere.</span>
            </h2>
            <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-ink/55">
              In Via S. Clemente 151, tra Legnano e Saronno. Ampio parcheggio, sala climatizzata,
              dehor e Wi‑Fi. Il posto giusto per una pausa di lavoro o una serata senza pensieri.
            </p>

            <div className="mt-8 space-y-3">
              <a
                href={venue?.maps}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 rounded-xl border border-ink/10 bg-paper p-4 transition-colors hover:border-flame/30"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-flame" />
                <div className="flex-1">
                  <p className="text-[0.56rem] font-extrabold tracking-[0.15em] text-ink/35 uppercase">
                    Indirizzo
                  </p>
                  <p className="mt-1 text-[0.84rem] font-semibold text-ink/75">
                    {venue?.address ?? "Via S. Clemente 151, 20023 Cerro Maggiore (MI)"}
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-ink/30" />
              </a>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`tel:${(venue?.phone ?? "").replace(/\s/g, "")}`}
                  className="flex items-start gap-3 rounded-xl border border-ink/10 bg-paper p-4 transition-colors hover:border-flame/30"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-flame" />
                  <div>
                    <p className="text-[0.56rem] font-extrabold tracking-[0.15em] text-ink/35 uppercase">
                      Telefono
                    </p>
                    <p className="mt-1 text-[0.84rem] font-semibold text-ink/75">
                      {venue?.phone ?? "0331 519111"}
                    </p>
                  </div>
                </a>
                <a
                  href={`mailto:${venue?.email}`}
                  className="flex items-start gap-3 rounded-xl border border-ink/10 bg-paper p-4 transition-colors hover:border-flame/30"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-flame" />
                  <div className="min-w-0">
                    <p className="text-[0.56rem] font-extrabold tracking-[0.15em] text-ink/35 uppercase">
                      Email
                    </p>
                    <p className="mt-1 truncate text-[0.84rem] font-semibold text-ink/75">
                      {venue?.email ?? "ristorantesichef@gmail.com"}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: Car, label: "Parcheggio" },
                { icon: Wifi, label: "Wi‑Fi" },
                { icon: UtensilsCrossed, label: "Dehor" },
              ].map((service) => (
                <span key={service.label} className="chip">
                  <service.icon className="size-3 text-flame" />
                  {service.label}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={130} className="lg:col-span-7">
            <div className="overflow-hidden rounded-[1.6rem] border border-ink/10 bg-paper shadow-[0_30px_80px_-55px_rgba(20,37,30,.55)]">
              <iframe
                title="Mappa del Ristorante Sì Chef"
                src="https://www.google.com/maps?q=Ristorante%20Si%20Chef%2C%20Via%20San%20Clemente%20151%2C%20Cerro%20Maggiore&output=embed"
                className="h-[22rem] w-full border-0 md:h-[28rem]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="grid gap-4 p-5 sm:grid-cols-2 md:p-6">
                <div>
                  <h3 className="flex items-center gap-2 text-[0.58rem] font-extrabold tracking-[0.18em] text-ink/40 uppercase">
                    <Clock3 className="size-3.5 text-flame" />
                    Orari di apertura
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {hours.map((h) => (
                      <li
                        key={h.dayOfWeek}
                        className="flex items-center justify-between gap-3 text-[0.74rem]"
                      >
                        <span className="text-ink/55">{h.label}</span>
                        <span className="font-semibold text-ink/75 tabular-nums">{hourLabel(h)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col justify-between gap-4 rounded-xl bg-ink p-5 text-cream">
                  <div>
                    <p className="text-[0.56rem] font-extrabold tracking-[0.16em] text-ember uppercase">
                      Sempre aperti
                    </p>
                    <p className="mt-2 font-display text-2xl leading-none">7 giorni su 7</p>
                    <p className="mt-2 text-[0.72rem] leading-relaxed text-cream/50">
                      Pranzo e cena, senza giorno di chiusura. Per gruppi e cerimonie chiamaci.
                    </p>
                  </div>
                  <Link to="/prenota" className="btn btn-gold btn-sm w-full">
                    Prenota un tavolo
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
