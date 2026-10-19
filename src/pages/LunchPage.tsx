import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, Check, Clock3, Coffee, Fish, Pizza, Salad, Users } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { useContent } from "@/lib/content";

const formulas = [
  {
    name: "Menù del giorno",
    price: 13,
    icon: Salad,
    tag: "Il più scelto",
    description: "Cambia ogni giorno, seguendo il mercato e la stagione. Servito a pranzo, dal lunedì al venerdì.",
    items: ["Primo del giorno", "Secondo con contorno", "Acqua o vino e caffè"],
    note: "Coperto incluso",
    featured: true,
  },
  {
    name: "Pizza & bibita",
    price: 13,
    icon: Pizza,
    tag: "Pausa veloce",
    description: "Una pizza a scelta dal nostro menu, con bibita in lattina o birra piccola.",
    items: ["Pizza a scelta", "Bibita 33 cl", "Servizio incluso"],
    note: "Lun–Ven, 12:00–14:30",
  },
  {
    name: "Menù di terra",
    price: 27,
    icon: Coffee,
    tag: "Su prenotazione",
    description: "Un percorso completo della nostra cucina di terra, pensato per chi vuole sedersi con calma.",
    items: ["Affettato misto", "Risotto porcini e Castelmagno", "Arrosto, patatine, dolce e caffè"],
    note: "Minimo 2 persone",
  },
  {
    name: "Menù di mare",
    price: 32,
    icon: Fish,
    tag: "Il mare in tavola",
    description: "Il meglio del pesce fresco, selezionato ogni giorno. Disponibile su prenotazione.",
    items: ["Insalata di mare", "Risotto ai frutti di mare", "Frittura mista, dolce e caffè"],
    note: "Minimo 2 persone",
  },
  {
    name: "Menù bimbi",
    price: 12,
    icon: Users,
    tag: "Per i più piccoli",
    description: "Un menù semplice e genuino, pensato per i bambini e per chi pranza in famiglia.",
    items: ["Piatto a scelta", "Patatine o contorno", "Acqua e dolce"],
    note: "Fino a 10 anni",
  },
];

export function LunchPage() {
  const { content } = useContent();
  const venue = content?.settings.venue;

  return (
    <>
      <PageHero
        eyebrow="Pranzo"
        title="Mezzogiorno"
        italic="con gusto."
        description="Una pausa vera, con piatti preparati al momento. Il menù del giorno cambia ogni giorno: chiedi al personale o guarda il menu aggiornato in sala."
        image="/assets/img/table.webp"
        crumb="Menu pranzo"
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/prenota" className="btn btn-gold">
            <CalendarCheck className="size-4" />
            Prenota per pranzo
          </Link>
          <Link to="/menu" className="btn btn-ghost-light">
            Menu completo
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </PageHero>

      <div className="border-b border-ink/10 bg-cream-2/50">
        <div className="shell flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-3 text-[0.6rem] font-extrabold tracking-[0.13em] text-ink/50 uppercase">
          <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-flame" /> Lun–Ven · 12:00–14:30</span>
          <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-flame" /> Servizio veloce</span>
          <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-flame" /> Disponibile anche per asporto</span>
        </div>
      </div>

      <section className="bg-cream py-16 md:py-24">
        <div className="shell">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">Le formule</span>
            <h2 className="mt-4 text-[clamp(2.2rem,5vw,4.2rem)]">
              Scegli la tua
              <br />
              <span className="display-italic text-flame">pausa pranzo.</span>
            </h2>
            <p className="mt-5 text-[0.92rem] leading-relaxed text-ink/55">
              Tutti i menù sono serviti con pane e coperto. Le formule sono disponibili in sala e
              per asporto, fino a esaurimento del giorno.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {formulas.map((formula, index) => {
              const Icon = formula.icon;
              return (
                <Reveal key={formula.name} delay={index * 70} className={formula.featured ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
                  <article
                    className={`flex h-full flex-col rounded-2xl border p-6 transition-transform duration-500 hover:-translate-y-1 ${
                      formula.featured
                        ? "border-ember/50 bg-ink text-cream shadow-xl"
                        : "border-ink/10 bg-paper"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className={`grid size-11 place-items-center rounded-full ${formula.featured ? "bg-cream/10 text-ember" : "bg-flame/8 text-flame"}`}>
                        <Icon className="size-5" />
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[0.5rem] font-extrabold tracking-[0.12em] uppercase ${formula.featured ? "bg-ember text-ink" : "bg-ink/5 text-ink/45"}`}>
                        {formula.tag}
                      </span>
                    </div>
                    <h3 className={`mt-5 text-[1.7rem] leading-none ${formula.featured ? "text-cream" : ""}`}>{formula.name}</h3>
                    <p className={`mt-1.5 font-display text-4xl ${formula.featured ? "text-ember" : "text-flame"}`}>{formula.price}€</p>
                    <p className={`mt-3 text-[0.8rem] leading-relaxed ${formula.featured ? "text-cream/55" : "text-ink/50"}`}>{formula.description}</p>
                    <ul className="mt-5 flex-1 space-y-2">
                      {formula.items.map((item) => (
                        <li key={item} className={`flex items-start gap-2 text-[0.78rem] ${formula.featured ? "text-cream/70" : "text-ink/65"}`}>
                          <Check className={`mt-0.5 size-3.5 shrink-0 ${formula.featured ? "text-ember" : "text-flame"}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className={`mt-5 border-t pt-3 text-[0.6rem] font-bold tracking-[0.1em] uppercase ${formula.featured ? "border-cream/10 text-cream/35" : "border-ink/10 text-ink/35"}`}>{formula.note}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-paper-2/60 py-16 md:py-20">
        <div className="shell grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <span className="eyebrow">Come funziona</span>
            <h2 className="mt-4 text-[clamp(2rem,4.4vw,3.6rem)]">Semplice, come dovrebbe essere.</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-3">
              {[
                ["01", "Scegli la formula", "Menù del giorno, pizza o uno dei nostri percorsi completi."],
                ["02", "Prenota o passa", "Prenota il tavolo oppure ordina per asporto dal sito."],
                ["03", "Buon pranzo", "Ti serviamo in tempi rapidi, senza rinunciare alla qualità."],
              ].map(([number, title, text]) => (
                <div key={number}>
                  <p className="font-display text-3xl text-flame/30">{number}</p>
                  <h3 className="mt-2 text-[1.15rem] font-semibold">{title}</h3>
                  <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink/50">{text}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-4 lg:col-start-9">
            <div className="rounded-[1.5rem] border border-ink/10 bg-paper p-6">
              <p className="text-[0.58rem] font-extrabold tracking-[0.18em] text-ink/35 uppercase">Hai esigenze particolari?</p>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-ink/60">
                Allergie, intolleranze o menù dedicati: chiamaci e troviamo insieme la soluzione.
                La cucina è a disposizione per adattare le proposte.
              </p>
              <a href={`tel:${(venue?.phone ?? "").replace(/\s/g, "")}`} className="btn btn-clay mt-5 w-full">
                {venue?.phone ?? "0331 519111"}
              </a>
              <Link to="/contatti" className="mt-2 flex items-center justify-center gap-1.5 py-2 text-[0.62rem] font-extrabold tracking-[0.1em] text-ink/45 uppercase hover:text-flame">
                Scrivici
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
