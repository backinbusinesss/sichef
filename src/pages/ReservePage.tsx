import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, Phone, ShieldCheck, Users } from "lucide-react";
import { useContent } from "@/lib/content";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ReservationWizard } from "@/components/sections/ReservationWizard";

export function ReservePage() {
  const { content } = useContent();
  const venue = content?.settings.venue;
  const settings = content?.settings.reservation;

  return (
    <>
      <PageHero
        eyebrow="Prenotazioni"
        title="Il tuo tavolo"
        italic="ti aspetta."
        description="Scegli data, orario e zona. Ti confermiamo noi via telefono o WhatsApp, di solito entro poche ore. La prenotazione è gratuita."
        image="/assets/img/interior.webp"
        crumb="Prenota"
      >
        <div className="flex flex-wrap gap-4 text-[0.62rem] font-bold tracking-[0.1em] text-cream/55 uppercase">
          <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-ember" /> Aperto 7 giorni su 7</span>
          <span className="inline-flex items-center gap-1.5"><Users className="size-3.5 text-ember" /> Fino a {settings?.maxParty ?? 12} persone online</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-ember" /> Nessun anticipo</span>
        </div>
      </PageHero>

      <section className="bg-cream py-12 md:py-16">
        <div className="shell">
          <ReservationWizard />
        </div>
      </section>

      <section className="border-t border-ink/10 bg-paper-2/50 py-14">
        <div className="shell grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Nessun anticipo",
              text: "Prenotare è gratuito. Nessuna carta richiesta, nessun deposito.",
            },
            {
              icon: Clock3,
              title: "Conferma rapida",
              text: "Ti ricontattiamo durante gli orari di apertura per confermare il tavolo.",
            },
            {
              icon: Users,
              title: "Gruppi e cerimonie",
              text: `Oltre ${settings?.maxParty ?? 12} persone organizziamo tutto su misura: chiamaci o scrivici.`,
            },
          ].map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              <div className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-flame/8 text-flame"><item.icon className="size-4" /></span>
                <div>
                  <h2 className="text-[1.15rem] font-semibold">{item.title}</h2>
                  <p className="mt-1 text-[0.78rem] leading-relaxed text-ink/50">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="shell mt-10">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-ink/10 bg-paper p-5 sm:flex-row sm:items-center">
            <p className="flex-1 text-[0.85rem] text-ink/55">
              Preferisci parlare con noi? Chiamaci, rispondiamo durante gli orari di apertura.
            </p>
            <a href={`tel:${(venue?.phone ?? "").replace(/\s/g, "")}`} className="btn btn-clay btn-sm">
              <Phone className="size-3.5" />
              {venue?.phone ?? "0331 519111"}
            </a>
            <Link to="/menu" className="btn btn-ghost btn-sm">
              Sfoglia il menu
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
