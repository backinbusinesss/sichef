import { CalendarDays } from "lucide-react";
import { useContent } from "@/lib/content";
import { Reveal, SectionHeading } from "@/components/Reveal";

const DAY_LABELS = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

export function PromosSection() {
  const { content } = useContent();
  const promos = content?.promos ?? [];
  const today = new Date().getDay();

  if (!promos.length) return null;

  return (
    <section id="promo" className="relative scroll-mt-20 bg-cream py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Ogni giorno"
          title="Un motivo in più"
          italic="per sedersi."
          description="Le nostre proposte della settimana: si ordinano in sala, senza codici e senza carte fedeltà. Basta scegliere il giorno giusto."
        />

        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo, index) => {
            const isToday = promo.dayOfWeek === today;
            const label =
              promo.badge ||
              (promo.dayOfWeek !== null ? DAY_LABELS[promo.dayOfWeek] : "Sempre disponibile");
            return (
              <Reveal key={promo.id} delay={index * 70}>
                <article
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-500 hover:-translate-y-1 ${
                    isToday
                      ? "border-ember/60 bg-ember/10"
                      : "border-ink/10 bg-paper hover:border-flame/25"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-white/45 px-3 py-1.5 text-[0.58rem] font-extrabold tracking-[0.12em] text-ink/60 uppercase">
                      <CalendarDays className="size-3 text-flame" />
                      {label}
                    </span>
                    {isToday && (
                      <span className="rounded-full bg-flame px-2.5 py-1 text-[0.52rem] font-extrabold tracking-[0.12em] text-white uppercase">
                        Oggi
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 text-[1.55rem] leading-[1.05]">{promo.title}</h3>
                  <p className="mt-2.5 flex-1 text-[0.8rem] leading-relaxed text-ink/50">
                    {promo.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[0.58rem] font-extrabold tracking-[0.14em] text-flame uppercase">
                    In sala
                    <span className="h-px w-7 bg-flame/40 transition-all duration-500 group-hover:w-12" />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
