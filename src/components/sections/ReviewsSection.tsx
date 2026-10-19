import { Star, Quote, ArrowUpRight } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/Reveal";

const reviews = [
  {
    text: "Pizza buonissima, personale gentile e disponibile. Locale molto carino, servizio veloce. Siamo usciti soddisfatti e sicuramente torneremo.",
    author: "Ospite Tripadvisor",
    meta: "Cena Â· Famiglia",
  },
  {
    text: "Bella esperienza: camerieri simpatici, veloci e attenti. Abbiamo preso due pizze buonissime e un dolce. Prezzi onesti, qualitÃ  davvero buona.",
    author: "Ospite Tripadvisor",
    meta: "Cena Â· Coppia",
  },
  {
    text: "La cucina a vista Ã¨ un plus notevole. La carne Ã¨ buonissima e anche il pesce. Le pizze sono buonissime. Super consigliato.",
    author: "Ospite Tripadvisor",
    meta: "Cena Â· Amici",
  },
];

export function ReviewsSection() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-cream md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 size-[30rem] rounded-full bg-ember/10 blur-[130px]"
      />
      <div className="shell relative">
        <SectionHeading
          tone="dark"
          eyebrow="Dicono di noi"
          title="A tavola,"
          italic="si sta bene."
          description="Oltre 70 recensioni su Tripadvisor e un punteggio di 8,6 su TheFork. Ma il complimento piÃ¹ bello resta quello di chi torna."
          action={
            <div className="flex items-center gap-4 rounded-2xl border border-cream/12 bg-cream/[0.04] px-5 py-4">
              <p className="font-display text-4xl leading-none text-ember">4,3</p>
              <div>
                <div className="flex gap-0.5 text-ember">
                  {[1, 2, 3, 4].map((star) => (
                    <Star key={star} className="size-3 fill-current" />
                  ))}
                  <Star className="size-3 fill-current opacity-50" />
                </div>
                <p className="mt-1 text-[0.6rem] tracking-wide text-cream/45">
                  70+ recensioni Â· Tripadvisor
                </p>
              </div>
            </div>
          }
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {reviews.map((review, index) => (
            <Reveal key={review.text} delay={index * 100}>
              <figure className="flex h-full flex-col rounded-2xl border border-cream/10 bg-cream/[0.035] p-6">
                <div className="flex items-center justify-between">
                  <Quote className="size-7 text-ember/70" />
                  <div className="flex gap-0.5 text-ember">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="size-3 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="mt-5 flex-1 font-display text-[1.35rem] leading-[1.25] text-cream/85">
                  â€œ{review.text}â€
                </blockquote>
                <figcaption className="mt-6 border-t border-cream/10 pt-4">
                  <p className="text-[0.72rem] font-bold text-cream/75">{review.author}</p>
                  <p className="mt-0.5 text-[0.58rem] tracking-[0.08em] text-cream/35 uppercase">
                    {review.meta}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={140}>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-cream/10 pt-6">
            <p className="text-[0.7rem] text-cream/35">
              TheFork: 8,6 / 10 Â· oltre 400 recensioni
            </p>
            <a
              href="https://www.tripadvisor.it/Restaurant_Review-g776177-d19970595-Reviews-Ristorante_Si_Chef-Cerro_Maggiore_Province_of_Milan_Lombardy.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[0.62rem] font-extrabold tracking-[0.13em] text-ember uppercase hover:text-cream"
            >
              Leggi tutte le recensioni
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

