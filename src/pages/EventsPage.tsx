import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Cake, CheckCircle2, Loader2, PartyPopper, Phone, Send, Users, Wine } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { api, ApiError } from "@/lib/api";
import { useContent } from "@/lib/content";
import { euro, formatDate } from "@/lib/utils";

const TYPES = [
  { icon: Cake, label: "Compleanni", text: "Torte, tavoli riservati e un menù pensato per festeggiare." },
  { icon: PartyPopper, label: "Battesimi e comunioni", text: "Pranzi e cene di famiglia con spazi dedicati e menù personalizzati." },
  { icon: Users, label: "Cene aziendali", text: "Sala riservata, menù di lavoro e fatturazione. Poche distrazioni, tanta sostanza." },
  { icon: Wine, label: "Cerimonie", text: "Un percorso completo, dal aperitivo al dolce, con il vino giusto." },
];

export function EventsPage() {
  const { content } = useContent();
  const [params] = useSearchParams();
  const preset = params.get("tipo") ?? "";
  const events = content?.events ?? [];
  const venue = content?.settings.venue;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: preset || "Compleanno",
    date: "",
    guests: "20",
    message: "",
  });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState("loading");
    setError(null);
    try {
      const details = [
        `Tipo evento: ${form.eventType}`,
        form.date ? `Data indicativa: ${formatDate(form.date)}` : "",
        `Numero ospiti: ${form.guests}`,
        "",
        form.message,
      ].filter(Boolean).join("\n");
      await api.post("/api/contact", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `Richiesta evento — ${form.eventType}`,
        message: details,
      });
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof ApiError ? err.message : "Invio non riuscito. Riprova o chiamaci.");
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Eventi & cerimonie"
        title="Le occasioni"
        italic="che contano."
        description="Compleanni, battesimi, comunioni, cene aziendali o semplicemente voglia di stare insieme. Al Sì Chef la sala si prepara per voi."
        image="/assets/img/event.webp"
        crumb="Eventi"
      >
        <a href="#richiesta" className="btn btn-gold">
          Richiedi un preventivo
          <ArrowRight className="size-3.5" />
        </a>
      </PageHero>

      <section className="bg-cream py-16 md:py-24">
        <div className="shell">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TYPES.map((type, index) => (
              <Reveal key={type.label} delay={index * 70}>
                <article className="h-full rounded-2xl border border-ink/10 bg-paper p-5">
                  <span className="grid size-10 place-items-center rounded-full bg-flame/8 text-flame"><type.icon className="size-4" /></span>
                  <h2 className="mt-4 text-[1.25rem]">{type.label}</h2>
                  <p className="mt-1.5 text-[0.76rem] leading-relaxed text-ink/50">{type.text}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <span className="eyebrow">I nostri format</span>
              <h2 className="mt-4 text-[clamp(2.1rem,4.8vw,3.8rem)]">
                Un evento su misura,
                <br />
                <span className="display-italic text-flame">senza pensieri.</span>
              </h2>
              <p className="mt-5 max-w-xl text-[0.9rem] leading-relaxed text-ink/55">
                Vi accompagneremo dalla scelta del menù all'allestimento del tavolo. Per gruppi,
                aziende e famiglie, con la possibilità di riservare una parte della sala o
                l'intero locale.
              </p>

              <div className="mt-8 space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex flex-col gap-2 rounded-xl border border-ink/10 bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[0.56rem] font-extrabold tracking-[0.13em] text-flame uppercase">{event.subtitle || event.badge}</p>
                      <h3 className="mt-1 text-[1.15rem] font-semibold">{event.title}</h3>
                      <p className="mt-0.5 text-[0.74rem] text-ink/45">{event.description}</p>
                    </div>
                    <Link to={`/eventi?tipo=${encodeURIComponent(event.title)}#richiesta`} className="btn btn-ghost btn-sm shrink-0">
                      {event.ctaLabel || "Richiedi"}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[["Fino a 90", "posti in sala"], ["Menù", "da 25 € a 45 €"], ["Parcheggio", "ampio e gratuito"]].map(([value, label]) => (
                  <div key={label} className="rounded-xl bg-ink px-4 py-4 text-cream">
                    <p className="font-display text-2xl text-ember">{value}</p>
                    <p className="mt-1 text-[0.58rem] font-bold tracking-[0.1em] text-cream/40 uppercase">{label}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={130} className="lg:col-span-5">
              <div className="overflow-hidden rounded-[1.6rem] border border-ink/10 bg-paper shadow-[0_24px_70px_-55px_rgba(20,37,30,.55)]">
                <img src="/assets/img/event-1.webp" alt="Tavolo apparecchiato per un evento" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                <div className="p-6">
                  <p className="text-[0.58rem] font-extrabold tracking-[0.16em] text-ink/35 uppercase">La sala</p>
                  <h3 className="mt-2 text-2xl">Spazio, luce e discrezione.</h3>
                  <p className="mt-2 text-[0.8rem] leading-relaxed text-ink/50">
                    Sala climatizzata, dehor, cucina a vista e un team abituato a gestire tavolate
                    numerose. Vi aiutiamo a scegliere il menu e i tempi di servizio.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Sala privata", "Menu personalizzato", "Allestimento", "Fatturazione"].map((tag) => (
                      <span key={tag} className="chip">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="richiesta" className="scroll-mt-24 bg-ink py-16 text-cream md:py-24">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <span className="eyebrow eyebrow-light">Parliamone</span>
            <h2 className="mt-4 text-[clamp(2.2rem,5vw,4rem)]">Raccontaci<br /><span className="display-italic text-ember">la tua idea.</span></h2>
            <p className="mt-5 text-[0.9rem] leading-relaxed text-cream/55">
              Compila il form: ti ricontattiamo per capire esigenze, data e numero di ospiti.
              Nessun impegno, solo una chiacchierata.
            </p>
            <div className="mt-7 space-y-3 text-[0.8rem] text-cream/60">
              <a href={`tel:${(venue?.phone ?? "").replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-cream">
                <Phone className="size-4 text-ember" /> {venue?.phone ?? "0331 519111"}
              </a>
              <a href={`mailto:${venue?.email}`} className="flex items-center gap-3 break-all hover:text-cream">
                <Send className="size-4 shrink-0 text-ember" /> {venue?.email ?? "ristorantesichef@gmail.com"}
              </a>
            </div>
            <div className="mt-7 rounded-xl border border-cream/10 bg-cream/[0.03] p-4 text-[0.7rem] leading-relaxed text-cream/40">
              Per gruppi oltre 30 persone consigliamo di contattarci con almeno 2 settimane di anticipo.
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-8">
            {state === "done" ? (
              <div className="rounded-[1.5rem] border border-cream/12 bg-cream/[0.04] p-8 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-ember text-ink"><CheckCircle2 className="size-6" /></span>
                <h3 className="mt-5 text-3xl">Richiesta inviata.</h3>
                <p className="mx-auto mt-2 max-w-md text-[0.85rem] leading-relaxed text-cream/55">
                  Grazie {form.name.split(" ")[0]}! Ti ricontattiamo al più presto per organizzare
                  il tuo evento. Se hai urgenza, chiamaci.
                </p>
                <button onClick={() => setState("idle")} className="btn btn-ghost-light mt-6">Invia un'altra richiesta</button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label field-label-dark" htmlFor="event-name">Nome e cognome *</label>
                  <input id="event-name" required className="field field-dark" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" />
                </div>
                <div>
                  <label className="field-label field-label-dark" htmlFor="event-phone">Telefono *</label>
                  <input id="event-phone" required className="field field-dark" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} autoComplete="tel" inputMode="tel" />
                </div>
                <div>
                  <label className="field-label field-label-dark" htmlFor="event-email">Email *</label>
                  <input id="event-email" type="email" required className="field field-dark" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" />
                </div>
                <div>
                  <label className="field-label field-label-dark" htmlFor="event-type">Tipo di evento</label>
                  <select id="event-type" className="field field-dark" value={form.eventType} onChange={(event) => setForm({ ...form, eventType: event.target.value })}>
                    {["Compleanno", "Battesimo", "Comunione", "Cena aziendale", "Cerimonia", "Altro"].map((type) => <option key={type} value={type} className="bg-ink">{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label field-label-dark" htmlFor="event-date">Data indicativa</label>
                  <input id="event-date" type="date" className="field field-dark" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
                </div>
                <div>
                  <label className="field-label field-label-dark" htmlFor="event-guests">Numero ospiti</label>
                  <input id="event-guests" type="number" min={1} max={90} className="field field-dark" value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label field-label-dark" htmlFor="event-message">Raccontaci l'occasione *</label>
                  <textarea id="event-message" rows={4} required className="field field-dark resize-none" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Es. 40 persone per un battesimo a pranzo, menù di terra, tavolo unico…" />
                </div>
                {error && <p className="sm:col-span-2 rounded-lg border border-flame/40 bg-flame/10 px-3 py-2 text-[0.75rem] text-red-200">{error}</p>}
                <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-[0.62rem] leading-relaxed text-cream/35">Inviando la richiesta accetti l'informativa privacy. Ti risponderemo via email o telefono.</p>
                  <button type="submit" disabled={state === "loading"} className="btn btn-gold shrink-0">
                    {state === "loading" ? <><Loader2 className="size-4 animate-spin" /> Invio…</> : <>Invia richiesta <ArrowRight className="size-3.5" /></>}
                  </button>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <section className="bg-paper-2/60 py-14">
        <div className="shell flex flex-col items-start justify-between gap-4 rounded-2xl border border-ink/10 bg-paper p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-2xl">Preferisci vederlo di persona?</p>
            <p className="mt-1 text-[0.82rem] text-ink/45">Prenota un sopralluogo o un aperitivo conoscitivo. {euro(0)} di impegno.</p>
          </div>
          <Link to="/prenota?tipo=evento" className="btn btn-clay">Prenota una visita</Link>
        </div>
      </section>
    </>
  );
}
