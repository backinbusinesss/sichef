import { useState } from "react";
import { CheckCircle2, Clock3, Loader2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { api, ApiError } from "@/lib/api";
import { useContent } from "@/lib/content";

export function ContactPage() {
  const { content } = useContent();
  const venue = content?.settings.venue;
  const hours = content?.hours ?? [];
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState("loading");
    setError(null);
    try {
      await api.post("/api/contact", form);
      setState("done");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setState("error");
      setError(err instanceof ApiError ? err.message : "Invio non riuscito. Riprova o chiamaci.");
    }
  };

  const hourLabel = (h: (typeof hours)[number]) => {
    if (h.isClosed) return "Chiuso";
    const lunch = h.lunchOpen && h.lunchClose ? `${h.lunchOpen}–${h.lunchClose}` : null;
    const dinner = h.dinnerOpen && h.dinnerClose ? `${h.dinnerOpen}–${h.dinnerClose}` : null;
    return [lunch, dinner].filter(Boolean).join(" / ");
  };

  return (
    <>
      <PageHero
        eyebrow="Contatti"
        title="Parliamone"
        italic="volentieri."
        description="Per una prenotazione, un evento, un'informazione o semplicemente per salutarci. Siamo in Via S. Clemente 151, a Cerro Maggiore."
        image="/assets/img/bar.webp"
        crumb="Contatti"
      />

      <section className="bg-cream py-14 md:py-20">
        <div className="shell">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Phone, label: "Telefono", value: venue?.phone ?? "0331 519111", href: `tel:${(venue?.phone ?? "").replace(/\s/g, "")}`, note: "Durante gli orari di apertura" },
              { icon: MessageCircle, label: "WhatsApp", value: venue?.phoneAlt ?? "339 600 0493", href: `https://wa.me/${venue?.whatsapp ?? "393396000493"}`, note: "Per gruppi ed eventi" },
              { icon: Mail, label: "Email", value: venue?.email ?? "ristorantesichef@gmail.com", href: `mailto:${venue?.email}`, note: "Rispondiamo entro 24h" },
              { icon: MapPin, label: "Indirizzo", value: "Via S. Clemente 151", href: venue?.maps, note: "20023 Cerro Maggiore (MI)" },
            ].map((card, index) => (
              <Reveal key={card.label} delay={index * 70}>
                <a href={card.href} target={card.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex h-full flex-col rounded-2xl border border-ink/10 bg-paper p-5 transition-all hover:-translate-y-0.5 hover:border-flame/30">
                  <span className="grid size-10 place-items-center rounded-full bg-flame/8 text-flame"><card.icon className="size-4" /></span>
                  <p className="mt-4 text-[0.54rem] font-extrabold tracking-[0.14em] text-ink/35 uppercase">{card.label}</p>
                  <p className="mt-1 text-[0.88rem] font-semibold break-words text-ink/80">{card.value}</p>
                  <p className="mt-1 text-[0.68rem] text-ink/40">{card.note}</p>
                </a>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <div className="rounded-[1.6rem] border border-ink/10 bg-paper p-6 md:p-8">
                <span className="eyebrow">Scrivici</span>
                <h2 className="mt-3 text-[clamp(2rem,4vw,3.2rem)]">Un messaggio, una risposta.</h2>
                <p className="mt-2 text-[0.84rem] leading-relaxed text-ink/50">
                  Compila il form e ti ricontattiamo. Per prenotazioni urgenti, chiamaci.
                </p>

                {state === "done" ? (
                  <div className="mt-6 rounded-2xl border border-emerald-700/20 bg-emerald-700/5 p-6 text-center">
                    <CheckCircle2 className="mx-auto size-8 text-emerald-700" />
                    <p className="mt-3 font-display text-2xl">Messaggio inviato.</p>
                    <p className="mt-1 text-[0.8rem] text-ink/50">Grazie! Ti risponderemo al più presto.</p>
                    <button onClick={() => setState("idle")} className="btn btn-ghost btn-sm mt-4">Scrivi un altro messaggio</button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="field-label" htmlFor="contact-name">Nome e cognome *</label>
                      <input id="contact-name" required className="field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="contact-phone">Telefono</label>
                      <input id="contact-phone" className="field" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} autoComplete="tel" inputMode="tel" />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="contact-email">Email *</label>
                      <input id="contact-email" type="email" required className="field" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="contact-subject">Oggetto</label>
                      <input id="contact-subject" className="field" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Prenotazione, evento, info…" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="field-label" htmlFor="contact-message">Messaggio *</label>
                      <textarea id="contact-message" required rows={5} className="field resize-none" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Come possiamo aiutarti?" />
                    </div>
                    {error && <p className="sm:col-span-2 rounded-lg border border-flame/30 bg-flame/8 px-3 py-2 text-[0.74rem] text-flame">{error}</p>}
                    <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[0.62rem] leading-relaxed text-ink/35">Inviando accetti l'informativa privacy. Non condividiamo i tuoi dati.</p>
                      <button type="submit" disabled={state === "loading"} className="btn btn-clay shrink-0">
                        {state === "loading" ? <><Loader2 className="size-4 animate-spin" /> Invio…</> : <>Invia messaggio <Send className="size-3.5" /></>}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </Reveal>

            <Reveal delay={120} className="lg:col-span-5">
              <div className="overflow-hidden rounded-[1.6rem] border border-ink/10 bg-paper">
                <iframe
                  title="Mappa del Ristorante Sì Chef"
                  src="https://www.google.com/maps?q=Ristorante%20Si%20Chef%2C%20Via%20San%20Clemente%20151%2C%20Cerro%20Maggiore&output=embed"
                  className="h-64 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="p-5">
                  <h3 className="flex items-center gap-2 text-[0.58rem] font-extrabold tracking-[0.16em] text-ink/35 uppercase"><Clock3 className="size-3.5 text-flame" /> Orari di apertura</h3>
                  <ul className="mt-3 space-y-1.5">
                    {hours.map((h) => (
                      <li key={h.dayOfWeek} className="flex items-center justify-between gap-3 text-[0.74rem]">
                        <span className="text-ink/50">{h.label}</span>
                        <span className="font-semibold text-ink/75 tabular-nums">{hourLabel(h)}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={venue?.maps} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm mt-5 w-full"><MapPin className="size-3.5" /> Apri in Google Maps</a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
