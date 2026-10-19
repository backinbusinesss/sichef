import { Link } from "react-router-dom";
import { ArrowRight, CalendarHeart } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { useContent } from "@/lib/content";

export function EventsSection() {
  const { content } = useContent();
  const events = (content?.events ?? []).slice(0, 4);

  return (
    <section id="eventi" className="bg-paper-2/60 py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Eventi & cerimonie"
          title="Le occasioni"
          italic="che contano."
          description="Compleanni, battesimi, comunioni, cene aziendali o semplicemente voglia di stare insieme. Al Sì Chef la sala si prepara per voi."
          action={
            <Link to="/eventi" className="btn btn-ghost">
              Organizza un evento
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event, index) => (
            <Reveal key={event.id} delay={index * 90}>
              <Link
                to={`/eventi?tipo=${encodeURIComponent(event.title)}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-[0_20px_60px_-50px_rgba(20,37,30,.5)] transition-transform duration-500 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-cream-2">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="grid size-full place-items-center bg-ink text-ember">
                      <CalendarHeart className="size-8" />
                    </div>
                  )}
                  {event.badge && (
                    <span className="absolute top-3 left-3 rounded-full bg-cream/90 px-2.5 py-1 text-[0.5rem] font-extrabold tracking-[0.12em] text-ink uppercase backdrop-blur-sm">
                      {event.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[0.56rem] font-bold tracking-[0.13em] text-flame uppercase">
                    {event.subtitle}
                  </p>
                  <h3 className="mt-2 text-[1.5rem] leading-[1.05]">{event.title}</h3>
                  <p className="mt-2.5 flex-1 text-[0.76rem] leading-relaxed text-ink/50">
                    {event.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[0.6rem] font-extrabold tracking-[0.11em] text-ink/55 uppercase transition-colors group-hover:text-flame">
                    {event.ctaLabel}
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
