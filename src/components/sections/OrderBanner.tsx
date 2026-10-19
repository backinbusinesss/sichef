import { Link } from "react-router-dom";
import { ArrowRight, Bike, Clock3, ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export function OrderBanner() {
  return (
    <section className="relative overflow-hidden bg-wine py-16 text-cream md:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 size-[30rem] rounded-full bg-ember/15 blur-[120px]"
      />
      <div className="shell relative">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <span className="eyebrow eyebrow-light">Asporto & domicilio</span>
            <h2 className="mt-5 max-w-xl text-[clamp(2.4rem,5.2vw,4.4rem)]">
              Il menu di Sì Chef,
              <br />
              <span className="display-italic text-ember">a casa tua.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[0.92rem] leading-relaxed text-cream/60">
              Ordina online e ritira in Via S. Clemente 151, oppure fatti consegnare a Cerro
              Maggiore e zone limitrofe. Il nostro fritto, le pizze e i menu completi, come in sala.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/ordina" className="btn btn-gold btn-lg">
                <ShoppingBag className="size-4" />
                Ordina online
              </Link>
              <Link to="/menu" className="btn btn-ghost-light btn-lg">
                Sfoglia il menu
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.66rem] font-semibold text-cream/45">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5 text-ember" />
                Pronto in 25 minuti
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bike className="size-3.5 text-ember" />
                Consegna 3 € · minimo 20 €
              </span>
            </div>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-5 lg:col-start-8">
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border border-cream/15 shadow-2xl">
                <img
                  src="/assets/img/dish-pizza.webp"
                  alt="Pizza appena sfornata"
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -left-4 rounded-2xl border border-cream/15 bg-ink/90 px-5 py-4 shadow-xl backdrop-blur-md">
                <p className="text-[0.52rem] font-extrabold tracking-[0.18em] text-cream/40 uppercase">
                  Il più ordinato
                </p>
                <p className="mt-1 font-display text-xl">Pizza Sì Chef</p>
                <p className="mt-0.5 text-[0.68rem] text-ember">€ 11,50</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
