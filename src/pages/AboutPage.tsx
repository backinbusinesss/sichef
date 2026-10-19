import { Link } from "react-router-dom";
import { ArrowRight, ChefHat, Fish, Heart, Leaf, Pizza, Quote, Star, Users, Wine } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { useContent } from "@/lib/content";

const values = [
  {
    icon: ChefHat,
    title: "Cucina vera",
    text: "Materie prime scelte, preparazioni fatte in casa e una cucina a vista che non nasconde nulla.",
  },
  {
    icon: Fish,
    title: "Pesce fresco",
    text: "Selezione quotidiana, cotture semplici e piatti che rispettano il sapore del mare.",
  },
  {
    icon: Pizza,
    title: "Pizza artigianale",
    text: "Impasto leggero, lunga maturazione e condimenti generosi. La pizza come piace a noi.",
  },
  {
    icon: Heart,
    title: "Accoglienza di famiglia",
    text: "Si entra come ospiti e si esce come amici. Il sorriso fa parte del servizio.",
  },
];

export function AboutPage() {
  const { content } = useContent();
  const venue = content?.settings.venue;

  return (
    <>
      <PageHero
        eyebrow="Chi siamo"
        title="Una storia di"
        italic="famiglia."
        description="Sì Chef è un ristorante pizzeria a Cerro Maggiore, tra Legnano e Saronno. Una cucina che parla di tradizione, di mare e di persone."
        image="/assets/img/team.webp"
        crumb="Chi siamo"
      />

      <section className="bg-cream py-16 md:py-24">
        <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <div className="relative">
              <div className="image-frame aspect-[4/5] max-w-md">
                <img src="/assets/img/chef.webp" alt="Lo chef al lavoro" loading="lazy" />
              </div>
              <div className="absolute -right-2 -bottom-6 w-52 rotate-2 overflow-hidden rounded-2xl border-[6px] border-cream shadow-xl sm:right-6">
                <img src="/assets/img/pizzaiolo.webp" alt="Il pizzaiolo al forno" className="aspect-square w-full object-cover" loading="lazy" />
              </div>
            </div>
          </Reveal>
          <div className="lg:col-span-6">
            <Reveal>
              <span className="eyebrow">La nostra idea</span>
              <h2 className="mt-4 text-[clamp(2.4rem,5.2vw,4.6rem)]">
                Il gusto delle cose
                <br />
                <span className="display-italic text-flame">fatte bene.</span>
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-6 space-y-4 text-[0.92rem] leading-relaxed text-ink/55">
                <p>
                  Al Sì Chef non trovate scorciatoie. Trovate la pasta mantecata al momento, il
                  pesce scelto la mattina, la pizza che lievita con calma e i piatti della
                  tradizione italiana serviti come si deve.
                </p>
                <p>
                  Siamo nel cuore di Cerro Maggiore, in un punto comodo tra Legnano e Saronno, con
                  un ampio parcheggio e una sala pensata per stare insieme. In famiglia, con gli
                  amici, per lavoro o per una ricorrenza: c'è sempre un buon motivo per sedersi.
                </p>
                <p>
                  La cucina è a vista, il pesce è fresco, le pizze escono dal forno una alla volta.
                  E dietro ogni piatto c'è una squadra che ci mette la faccia.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/menu" className="btn btn-clay">Scopri il menu <ArrowRight className="size-3.5" /></Link>
                <Link to="/contatti" className="btn btn-ghost">Vieni a trovarci</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-paper-2/60 py-16 md:py-20">
        <div className="shell">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">I nostri valori</span>
            <h2 className="mt-4 text-[clamp(2.1rem,4.6vw,3.8rem)]">Quattro cose a cui non rinunciamo.</h2>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 80}>
                <div className="h-full rounded-2xl border border-ink/10 bg-paper p-6">
                  <span className="grid size-11 place-items-center rounded-full bg-flame/8 text-flame"><value.icon className="size-5" /></span>
                  <h3 className="mt-4 text-[1.3rem]">{value.title}</h3>
                  <p className="mt-2 text-[0.78rem] leading-relaxed text-ink/50">{value.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-16 text-cream md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-0 size-[30rem] rounded-full bg-flame/15 blur-[120px]" />
        <div className="shell relative grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <span className="eyebrow eyebrow-light">La sala</span>
            <h2 className="mt-4 text-[clamp(2.2rem,4.8vw,4rem)]">Un posto dove<br /><span className="display-italic text-ember">si sta bene.</span></h2>
            <p className="mt-5 max-w-xl text-[0.9rem] leading-relaxed text-cream/55">
              Sala climatizzata, dehor, Wi-Fi, parcheggio e cucina a vista. Il locale è pensato
              per il pranzo di lavoro, la cena in famiglia e le occasioni speciali. Accettiamo
              pagamenti elettronici e organizziamo menu dedicati per gruppi e cerimonie.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Parcheggio", "Wi‑Fi", "Dehor", "Sala climatizzata", "Sky", "Pagamenti elettronici", "Accessibile"].map((service) => (
                <span key={service} className="chip chip-dark">{service}</span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/prenota" className="btn btn-gold">Prenota un tavolo</Link>
              <Link to="/eventi" className="btn btn-ghost-light">Organizza un evento</Link>
            </div>
          </Reveal>
          <Reveal delay={130} className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              <img src="/assets/img/venue-interior.webp" alt="Interno del ristorante" className="aspect-[3/4] w-full rounded-2xl object-cover" loading="lazy" />
              <img src="/assets/img/bar.webp" alt="Il bancone del ristorante" className="mt-8 aspect-[3/4] w-full rounded-2xl object-cover" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-20">
        <div className="shell grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <span className="eyebrow">Dicono di noi</span>
            <h2 className="mt-4 text-[clamp(2rem,4.4vw,3.5rem)]">Le parole<br /><span className="display-italic text-flame">degli ospiti.</span></h2>
            <div className="mt-5 flex items-center gap-3">
              <p className="font-display text-4xl text-flame">4,3</p>
              <div>
                <div className="flex gap-0.5 text-ember">{[1,2,3,4].map((n) => <Star key={n} className="size-3.5 fill-current" />)}<Star className="size-3.5 fill-current opacity-40" /></div>
                <p className="mt-1 text-[0.6rem] tracking-wide text-ink/40">70+ recensioni Tripadvisor</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Pizza buonissima, personale gentile e disponibile. Locale molto carino e servizio veloce.",
                "La cucina a vista è un plus notevole. La carne è buonissima e anche il pesce. Super consigliato.",
                "Camerieri simpatici, veloci e attenti. Due pizze buonissime e un dolce. Prezzi onesti.",
                "Ottimo ristorante, cibo abbondante e buono. Personale cortese e professionale.",
              ].map((quote) => (
                <figure key={quote} className="flex h-full flex-col rounded-2xl border border-ink/10 bg-paper p-5">
                  <Quote className="size-5 text-ember" />
                  <blockquote className="mt-3 flex-1 font-display text-[1.15rem] leading-snug text-ink/80">“{quote}”</blockquote>
                  <figcaption className="mt-4 text-[0.58rem] font-bold tracking-[0.12em] text-ink/35 uppercase">Ospite Tripadvisor</figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        </div>
        <div className="shell mt-12">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-ink/10 bg-paper p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-flame/8 text-flame"><Leaf className="size-4" /></span>
              <p className="text-[0.82rem] text-ink/55">Allergie o intolleranze? Parlane con noi: troviamo la soluzione.</p>
            </div>
            <a href={`tel:${(venue?.phone ?? "").replace(/\s/g, "")}`} className="btn btn-ghost btn-sm"><Users className="size-3.5" /> {venue?.phone ?? "0331 519111"}</a>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 text-[0.6rem] tracking-[0.12em] text-ink/30 uppercase">
            <Wine className="size-3.5" /> Ristorante · Pizzeria · Pesce fresco
          </div>
        </div>
      </section>
    </>
  );
}
