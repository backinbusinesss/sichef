import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Cake, CheckCircle2, Gift, Loader2, Mail, Search, Sparkles, Star } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { api, ApiError } from "@/lib/api";
import { useContent } from "@/lib/content";
import { cn, euro } from "@/lib/utils";
import type { LoyaltyMember, LoyaltyTransaction } from "@/lib/types";

type LookupResult = { member: LoyaltyMember; transactions: LoyaltyTransaction[] };

const benefits = [
  { icon: Star, title: "1 punto per euro", text: "Accumula punti su ogni consumazione in sala, asporto e domicilio." },
  { icon: Gift, title: "100 punti = 10 €", text: "Raggiungi la soglia e ricevi uno sconto da usare alla tua visita successiva." },
  { icon: Cake, title: "Regalo di benvenuto", text: "Iscriviti e partecipa con un piccolo bonus punti fin da subito." },
];

export function LoyaltyPage() {
  const { content } = useContent();
  const settings = content?.settings.loyalty;
  const reward = settings?.rewardThreshold ?? 100;
  const rewardValue = settings?.rewardValue ?? 10;

  const [tab, setTab] = useState<"join" | "lookup">("join");
  const [join, setJoin] = useState({ name: "", email: "", phone: "", birthday: "" });
  const [joinState, setJoinState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [member, setMember] = useState<LoyaltyMember | null>(null);
  const [welcome, setWelcome] = useState(0);

  const [lookup, setLookup] = useState({ email: "", code: "" });
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);

  const submitJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    setJoinState("loading");
    setJoinError(null);
    try {
      const result = await api.post<{ member: LoyaltyMember; welcomePoints: number }>("/api/loyalty", join);
      setMember(result.member);
      setWelcome(result.welcomePoints);
      setJoinState("done");
      setTab("lookup");
      setLookup({ email: result.member.email, code: result.member.code });
    } catch (error) {
      setJoinState("error");
      setJoinError(error instanceof ApiError ? error.message : "Iscrizione non riuscita. Riprova.");
    }
  };

  const submitLookup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLookupState("loading");
    setLookupError(null);
    setLookupResult(null);
    try {
      const result = await api.get<LookupResult>(
        `/api/loyalty?email=${encodeURIComponent(lookup.email)}&code=${encodeURIComponent(lookup.code)}`,
      );
      setLookupResult(result);
      setLookupState("done");
    } catch (error) {
      setLookupState("error");
      setLookupError(error instanceof ApiError ? error.message : "Non riusciamo a trovare la tessera.");
    }
  };

  const shownMember = lookupResult?.member ?? member;
  const progress = shownMember ? Math.min(100, (shownMember.points / reward) * 100) : 0;

  return (
    <>
      <PageHero
        eyebrow="Programma fedeltà"
        title="Ogni euro,"
        italic="un punto."
        description="La nostra carta fedeltà premia chi torna. Niente plastica, niente app: solo il tuo codice e i punti che accumuli."
        image="/assets/img/wine.webp"
        crumb="Fedeltà"
      >
        <div className="flex flex-wrap gap-3">
          <a href="#tessera" className="btn btn-gold">
            <Sparkles className="size-4" />
            Iscriviti gratis
          </a>
          <Link to="/menu" className="btn btn-ghost-light">
            Scopri il menu
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </PageHero>

      <section className="bg-cream py-16 md:py-24">
        <div className="shell">
          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Reveal key={benefit.title} delay={index * 80}>
                <div className="h-full rounded-2xl border border-ink/10 bg-paper p-6">
                  <span className="grid size-11 place-items-center rounded-full bg-flame/8 text-flame"><benefit.icon className="size-5" /></span>
                  <h2 className="mt-4 text-[1.35rem]">{benefit.title}</h2>
                  <p className="mt-2 text-[0.8rem] leading-relaxed text-ink/50">{benefit.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div id="tessera" className="mt-14 grid scroll-mt-28 gap-6 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <div className="rounded-[1.8rem] border border-ink/10 bg-ink p-6 text-cream shadow-2xl md:p-9">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="eyebrow eyebrow-light">La tua tessera</span>
                    <h2 className="mt-3 text-[clamp(2rem,4.5vw,3.4rem)]">Entra nel club.</h2>
                  </div>
                  <div className="flex rounded-full bg-cream/10 p-1">
                    <button onClick={() => setTab("join")} className={cn("rounded-full px-4 py-2 text-[0.58rem] font-extrabold tracking-[0.1em] uppercase transition-colors", tab === "join" ? "bg-cream text-ink" : "text-cream/55")}>Iscriviti</button>
                    <button onClick={() => setTab("lookup")} className={cn("rounded-full px-4 py-2 text-[0.58rem] font-extrabold tracking-[0.1em] uppercase transition-colors", tab === "lookup" ? "bg-cream text-ink" : "text-cream/55")}>I miei punti</button>
                  </div>
                </div>

                {tab === "join" ? (
                  <form onSubmit={submitJoin} className="mt-7 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="field-label field-label-dark" htmlFor="loyalty-name">Nome e cognome *</label>
                      <input id="loyalty-name" required className="field field-dark" value={join.name} onChange={(event) => setJoin({ ...join, name: event.target.value })} autoComplete="name" placeholder="Mario Rossi" />
                    </div>
                    <div>
                      <label className="field-label field-label-dark" htmlFor="loyalty-email">Email *</label>
                      <input id="loyalty-email" type="email" required className="field field-dark" value={join.email} onChange={(event) => setJoin({ ...join, email: event.target.value })} autoComplete="email" placeholder="mario@email.it" />
                    </div>
                    <div>
                      <label className="field-label field-label-dark" htmlFor="loyalty-phone">Telefono</label>
                      <input id="loyalty-phone" className="field field-dark" value={join.phone} onChange={(event) => setJoin({ ...join, phone: event.target.value })} autoComplete="tel" placeholder="333 123 4567" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="field-label field-label-dark" htmlFor="loyalty-birthday">Compleanno (facoltativo)</label>
                      <input id="loyalty-birthday" type="date" className="field field-dark" value={join.birthday} onChange={(event) => setJoin({ ...join, birthday: event.target.value })} />
                      <p className="mt-1.5 text-[0.66rem] text-cream/35">Ti riserviamo un pensiero nel mese del tuo compleanno.</p>
                    </div>
                    {joinError && <p className="sm:col-span-2 rounded-lg border border-flame/40 bg-flame/10 px-3 py-2 text-[0.74rem] text-red-200">{joinError}</p>}
                    {joinState === "done" && member && (
                      <div className="sm:col-span-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                        <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-emerald-200"><CheckCircle2 className="size-4" /> Benvenuto{member.name ? `, ${member.name.split(" ")[0]}` : ""}!</p>
                        <p className="mt-1 text-[0.72rem] text-cream/55">Il tuo codice tessera è <strong className="font-mono text-ember">{member.code}</strong>. Hai ricevuto {welcome} punti di benvenuto.</p>
                      </div>
                    )}
                    <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[0.62rem] leading-relaxed text-cream/35">Iscrizione gratuita. Acconsento al trattamento dei dati per la gestione del programma fedeltà.</p>
                      <button type="submit" disabled={joinState === "loading"} className="btn btn-gold shrink-0">
                        {joinState === "loading" ? <><Loader2 className="size-4 animate-spin" /> Iscrizione…</> : <>Iscriviti <ArrowRight className="size-3.5" /></>}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={submitLookup} className="mt-7 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="field-label field-label-dark" htmlFor="lookup-email">Email *</label>
                      <input id="lookup-email" type="email" required className="field field-dark" value={lookup.email} onChange={(event) => setLookup({ ...lookup, email: event.target.value })} autoComplete="email" placeholder="mario@email.it" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="field-label field-label-dark" htmlFor="lookup-code">Codice tessera *</label>
                      <input id="lookup-code" required className="field field-dark font-mono uppercase" value={lookup.code} onChange={(event) => setLookup({ ...lookup, code: event.target.value.toUpperCase() })} placeholder="SC-ABC123" />
                    </div>
                    {lookupError && <p className="sm:col-span-2 rounded-lg border border-flame/40 bg-flame/10 px-3 py-2 text-[0.74rem] text-red-200">{lookupError}</p>}
                    <button type="submit" disabled={lookupState === "loading"} className="btn btn-gold sm:col-span-2">
                      {lookupState === "loading" ? <><Loader2 className="size-4 animate-spin" /> Cerco…</> : <><Search className="size-4" /> Controlla i punti</>}
                    </button>
                  </form>
                )}

                {lookupResult && (
                  <div className="mt-6 rounded-2xl border border-cream/12 bg-cream/[0.04] p-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-[0.54rem] font-extrabold tracking-[0.16em] text-cream/40 uppercase">Ciao {lookupResult.member.name.split(" ")[0]}</p>
                        <p className="mt-1 font-display text-4xl text-ember">{lookupResult.member.points} <span className="text-lg text-cream/40">punti</span></p>
                      </div>
                      <BadgeCheck className="size-8 text-ember/70" />
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-cream/10">
                      <div className="h-full rounded-full bg-ember transition-all duration-700" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-2 text-[0.68rem] text-cream/45">Ti mancano {Math.max(0, reward - lookupResult.member.points)} punti per {euro(rewardValue)} di sconto.</p>
                    {lookupResult.transactions.length > 0 && (
                      <div className="mt-4 border-t border-cream/10 pt-3">
                        <p className="text-[0.54rem] font-extrabold tracking-[0.14em] text-cream/35 uppercase">Ultimi movimenti</p>
                        <ul className="mt-2 space-y-1.5">
                          {lookupResult.transactions.slice(0, 6).map((transaction) => (
                            <li key={transaction.id} className="flex items-center justify-between gap-3 text-[0.72rem] text-cream/60">
                              <span>{transaction.reason}</span>
                              <span className={transaction.points >= 0 ? "text-emerald-400" : "text-red-300"}>{transaction.points >= 0 ? "+" : ""}{transaction.points}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {member && tab === "lookup" && !lookupResult && (
                  <div className="mt-5 rounded-xl border border-ember/25 bg-ember/8 p-4 text-[0.75rem] leading-relaxed text-cream/60">
                    La tua tessera è pronta: <strong className="font-mono text-ember">{member.code}</strong>. Inserisci email e codice qui sopra per vedere i punti.
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={130} className="lg:col-span-4 lg:col-start-9">
              <div className="rounded-[1.8rem] border border-ink/10 bg-paper p-6 md:p-7">
                <h3 className="text-2xl">Come funziona</h3>
                <ol className="mt-5 space-y-4">
                  {[
                    ["Iscriviti", "Ti diamo un codice personale e i punti di benvenuto."],
                    ["Accumula", "Ogni euro speso vale un punto. Comunica il codice alla cassa."],
                    ["Riscatta", `Ogni ${reward} punti ricevi ${euro(rewardValue)} di sconto.`],
                  ].map(([title, text], index) => (
                    <li key={title} className="flex gap-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[0.65rem] font-bold text-cream">{index + 1}</span>
                      <div>
                        <p className="text-[0.86rem] font-semibold">{title}</p>
                        <p className="mt-0.5 text-[0.74rem] leading-relaxed text-ink/45">{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 rounded-xl bg-cream p-4 text-[0.68rem] leading-relaxed text-ink/45">
                  I punti non hanno scadenza e sono cumulabili. Lo sconto non è convertibile in denaro e non è cumulabile con altre promozioni.
                </div>
                <a href="mailto:ristorantesichef@gmail.com" className="mt-4 flex items-center gap-2 text-[0.64rem] font-extrabold tracking-[0.1em] text-flame uppercase">
                  <Mail className="size-3.5" />
                  Scrivici per assistenza
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
