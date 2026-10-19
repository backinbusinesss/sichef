import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Utensils, Wine } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const menus = [
  {
    title: "Pranzo completo",
    price: "13",
    items: ["Primo del giorno", "Secondo + contorno", "Acqua o vino + caffè"],
    icon: Utensils,
    note: "Lun–Ven · 12:00–14:30",
  },
  {
    title: "Pizza & bibita",
    price: "13",
    items: ["Pizza a scelta", "Bibita 33 cl", "Servizio incluso"],
    icon: Clock3,
    note: "Lun–Ven · 12:00–14:30",
    featured: true,
  },
  {
    title: "Menu di terra",
    price: "27",
    items: ["Affettato misto", "Risotto porcini e Castelmagno", "Arrosto, patatine, dolce e caffè"],
    icon: Wine,
    note: "Tutti i giorni, su prenotazione",
  },
];

export function LunchSection() {
  return (
    <section id="pranzo" className="relative overflow-hidden bg-ink py-20 text-cream md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-10 size-[32rem] rounded-full bg-flame/15 blur-[130px]"
      />
      <div className="shell relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="eyebrow eyebrow-light">Il pranzo</span>
              <h2 className="mt-5 text-[clamp(2.5rem,5.6vw,5rem)]">
                A mezzogiorno,
                <br />
                <span className="display-italic text-ember">si mangia bene.</span>
              </h2>
              <p className="mt-6 max-w-md text-[0.94rem] leading-relaxed text-cream/60">
                Il menù del pranzo cambia ogni giorno, seguendo il mercato e la stagione. Una
                formula completa, servita veloce ma senza fretta: il tempo di stare bene.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-8 overflow-hidden rounded-[1.4rem] border border-cream/10">
                <img
                  src="/assets/img/table.webp"
                  alt="Tavolo apparecchiato con pasta e vino"
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/menu-pranzo" className="btn btn-gold">
                  Menu pranzo
                  <ArrowRight className="size-3.5" />
                </Link>
                <Link to="/prenota" className="btn btn-ghost-light">
                  Prenota
                </Link>
              </div>
              <p className="mt-4 text-[0.68rem] text-cream/35">
                Il menù del giorno è disponibile in sala e per asporto.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="grid gap-3">
              {menus.map((menu, index) => {
                const Icon = menu.icon;
                return (
                  <Reveal key={menu.title} delay={index * 90}>
                    <article
                      className={`group flex items-start gap-4 rounded-2xl border p-5 transition-colors ${
                        menu.featured
                          ? "border-ember/45 bg-ember/10"
                          : "border-cream/10 bg-cream/[0.035] hover:border-cream/25"
                      }`}
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-cream/15 bg-ink/30 text-ember">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-[1.55rem] leading-none">{menu.title}</h3>
                            <p className="mt-1.5 text-[0.58rem] font-bold tracking-[0.13em] text-cream/40 uppercase">
                              {menu.note}
                            </p>
                          </div>
                          <p className="shrink-0 font-display text-3xl leading-none text-ember">
                            {menu.price}€
                          </p>
                        </div>
                        <ul className="mt-3.5 grid gap-1.5 text-[0.78rem] text-cream/55 sm:grid-cols-3">
                          {menu.items.map((item) => (
                            <li key={item} className="flex items-start gap-1.5">
                              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ember/70" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
