import { Link } from "react-router-dom";
import { ArrowUpRight, Quote } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useContent } from "@/lib/content";

export function StorySection() {
  const { content } = useContent();
  const venue = content?.settings.venue;

  return (
    <section id="storia" className="relative overflow-hidden bg-cream py-20 md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 size-[28rem] rounded-full bg-ember/10 blur-3xl"
      />
      <div className="shell relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:mx-0">
              <div className="image-frame aspect-[4/5] bg-cream-2">
                <img
                  src="/assets/img/team.webp"
                  alt="La squadra del Ristorante Sì Chef"
                  loading="lazy"
                />
              </div>
              <div className="absolute -right-4 -bottom-8 hidden w-44 rotate-2 overflow-hidden rounded-2xl border-[6px] border-cream bg-cream shadow-xl sm:block">
                <img
                  src="/assets/img/venue-interior.webp"
                  alt="La sala del ristorante"
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -top-4 -left-4 grid size-20 place-items-center rounded-full border border-ink/10 bg-paper text-center shadow-lg">
                <div>
                  <p className="font-display text-2xl leading-none text-flame">4,3</p>
                  <p className="mt-1 text-[0.45rem] font-extrabold tracking-[0.12em] text-ink/40 uppercase">
                    Tripadvisor
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <span className="eyebrow">Chi siamo</span>
              <h2 className="mt-5 text-[clamp(2.4rem,5.4vw,4.8rem)]">
                Si entra come ospiti,
                <br />
                <span className="display-italic text-flame">si esce come famiglia.</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-7 space-y-4 text-[0.94rem] leading-relaxed text-ink/60">
                <p>
                  Sì Chef è un ristorante pizzeria nel cuore di Cerro Maggiore, in un punto
                  strategico tra Legnano e Saronno. Una cucina basata sulla tradizione, un clima
                  familiare e la voglia di farvi uscire sazi e soddisfatti.
                </p>
                <p>
                  In sala trovate chi vi consiglia il piatto giusto e il vino giusto. In cucina,
                  materie prime scelte, pesce fresco e pasta fatta come si deve. In pizzeria,
                  un impasto leggero e condimenti senza scorciatoie.
                </p>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-8 grid grid-cols-3 gap-4 border-y border-ink/10 py-6">
                {[
                  ["7/7", "Sempre aperti"],
                  ["€13", "Pranzo completo"],
                  ["4,3", "Valutazione media"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="font-display text-3xl leading-none text-ink">{value}</p>
                    <p className="mt-1.5 text-[0.58rem] font-extrabold tracking-[0.13em] text-ink/40 uppercase">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to="/chi-siamo" className="btn btn-clay">
                  La nostra storia
                  <ArrowUpRight className="size-3.5" />
                </Link>
                <Link to="/contatti" className="btn btn-ghost">
                  Vieni a trovarci
                </Link>
              </div>
              <p className="mt-6 flex items-start gap-2 text-[0.78rem] leading-relaxed text-ink/45">
                <Quote className="mt-0.5 size-4 shrink-0 text-ember" />
                {venue?.claim ?? "La tradizione, servita con il sorriso."}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
