import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  Minus,
  Phone,
  Plus,
  Users,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useContent } from "@/lib/content";
import { addDays, cn, formatDate, todayIso, WEEKDAYS } from "@/lib/utils";
import type { AvailabilitySlot } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

const AREAS = [
  { value: "sala", label: "Sala", hint: "Il cuore del locale" },
  { value: "dehor", label: "Dehor", hint: "Luce e aria aperta" },
  { value: "veranda", label: "Veranda", hint: "La zona più tranquilla" },
  { value: "privato", label: "Spazio privato", hint: "Per gruppi ed eventi" },
];

const OCCASIONS = [
  "",
  "Compleanno",
  "Anniversario",
  "Cena di lavoro",
  "Cena aziendale",
  "Battesimo / comunione",
  "Altro",
];

export function ReservationWizard() {
  const { content } = useContent();
  const settings = content?.settings.reservation;
  const [params] = useSearchParams();
  const isEvent = params.get("tipo") === "evento";

  const [step, setStep] = useState(1);
  const [date, setDate] = useState(todayIso());
  const [partySize, setPartySize] = useState(2);
  const [time, setTime] = useState("");
  const [area, setArea] = useState("sala");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    occasion: isEvent ? "Cena aziendale" : "",
    notes: "",
  });
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [closedReason, setClosedReason] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<{ date: string; time: string; partySize: number } | null>(
    null,
  );

  const days = useMemo(() => {
    const start = todayIso();
    return Array.from({ length: 14 }).map((_, index) => addDays(start, index));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    setClosedReason(null);
    setTime("");
    api
      .get<{ closed: boolean; reason?: string; slots: AvailabilitySlot[] }>(
        `/api/availability?date=${date}`,
      )
      .then((data) => {
        if (cancelled) return;
        if (data.closed) {
          setClosedReason(data.reason || "Siamo chiusi in questa data.");
          setSlots([]);
        } else {
          setSlots(data.slots);
        }
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const canNext =
    step === 1 ? Boolean(date) : step === 2 ? Boolean(time) : step === 3 ? Boolean(area) : true;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const result = await api.post<{
        reservation: { date: string; time: string; partySize: number };
      }>("/api/reservations", { ...form, date, time, area, partySize });
      setConfirmed(result.reservation);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setFieldErrors(err.fields);
        setError(err.message);
      } else {
        setError("Qualcosa è andato storto. Riprova.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-[2rem] border border-emerald-800/20 bg-white/60 p-8 text-center shadow-[0_30px_80px_-60px_rgba(20,37,30,.5)]">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-ink text-cream">
            <Check className="size-7" />
          </span>
          <h2 className="mt-6 text-4xl">Richiesta inviata.</h2>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-ink/55">
            Ti ricontatteremo al più presto per confermare. Se hai urgenza chiamaci: rispondiamo
            sempre.
          </p>
          <dl className="mt-7 grid grid-cols-3 gap-3 rounded-2xl border border-ink/10 bg-cream p-4 text-left">
            <div>
              <dt className="text-[0.54rem] font-extrabold tracking-[0.15em] text-ink/35 uppercase">
                Data
              </dt>
              <dd className="mt-1 text-[0.8rem]">

                {formatDate(confirmed.date, { day: "2-digit", month: "short" })}
              </dd>
            </div>
            <div>
              <dt className="text-[0.54rem] font-extrabold tracking-[0.15em] text-ink/35 uppercase">
                Ora
              </dt>
              <dd className="mt-1 text-[0.8rem]">{confirmed.time}</dd>
            </div>
            <div>
              <dt className="text-[0.54rem] font-extrabold tracking-[0.15em] text-ink/35 uppercase">
                Persone
              </dt>
              <dd className="mt-1 text-[0.8rem]">{confirmed.partySize}</dd>
            </div>
          </dl>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <Link to="/" className="btn btn-ghost flex-1">
              Torna alla home
            </Link>
            <a
              href={`tel:${(content?.settings.venue?.phone ?? "").replace(/\s/g, "")}`}
              className="btn btn-clay flex-1"
            >
              <Phone className="size-4" />
              Chiamaci
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0">
        <ol className="mb-8 flex items-center gap-2">
          {["Data", "Orario", "Zona", "Dettagli"].map((label, index) => {
            const number = index + 1;
            const active = step === number;
            const done = step > number;
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <button
                  onClick={() => number < step && setStep(number)}
                  disabled={number > step}
                  className={cn(
                    "flex items-center gap-2 text-[0.58rem] font-extrabold tracking-[0.14em] uppercase transition-colors",
                    active ? "text-ink" : done ? "text-flame" : "text-ink/30",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full border text-[0.58rem]",
                      active
                        ? "border-flame bg-flame text-white"
                        : done
                          ? "border-flame/40 text-flame"
                          : "border-ink/15",
                    )}
                  >
                    {done ? <Check className="size-3" /> : number}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {index < 3 && <span className="h-px flex-1 bg-ink/10" />}
              </li>
            );
          })}
        </ol>

        {step === 1 && (
          <Reveal>
            <h2 className="text-4xl">Quando vuoi venire?</h2>
            <p className="mt-2 text-[0.88rem] text-ink/50">
              Scegli la data: gli orari disponibili si aggiornano in tempo reale.
            </p>

            <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">
              {days.map((day) => {
                const d = new Date(`${day}T12:00:00`);
                const active = day === date;
                return (
                  <button
                    key={day}
                    onClick={() => setDate(day)}
                    className={cn(
                      "flex w-[4.4rem] shrink-0 flex-col items-center gap-1 rounded-2xl border py-3 transition-all",
                      active
                        ? "border-flame bg-flame text-white shadow-lg shadow-flame/20"
                        : "border-ink/10 bg-white/50 text-ink/70 hover:border-flame/40",
                    )}
                  >
                    <span className="text-[0.56rem] font-extrabold tracking-[0.12em] uppercase opacity-70">
                      {WEEKDAYS[d.getDay()]}
                    </span>
                    <span className="font-display text-xl leading-none">{d.getDate()}</span>
                    <span className="text-[0.52rem] uppercase opacity-60">
                      {new Intl.DateTimeFormat("it-IT", { month: "short" }).format(d)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-ink/10 bg-white/55 p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[0.64rem] font-extrabold tracking-[0.14em] text-ink/55 uppercase">
                  <Users className="size-3.5 text-flame" /> Quante persone
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPartySize((v) => Math.max(1, v - 1))}
                    className="grid size-9 place-items-center rounded-full border border-ink/15 hover:border-flame"
                    aria-label="Diminuisci"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-8 text-center font-display text-2xl tabular-nums">
                    {partySize}
                  </span>
                  <button
                    onClick={() => setPartySize((v) => Math.min(settings?.maxParty ?? 12, v + 1))}
                    className="grid size-9 place-items-center rounded-full border border-ink/15 hover:border-flame"
                    aria-label="Aumenta"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
              {partySize >= (settings?.maxParty ?? 12) && (
                <p className="mt-3 text-[0.72rem] leading-relaxed text-flame">
                  {settings?.notice ?? "Per gruppi più grandi scrivici su WhatsApp."}
                </p>
              )}
            </div>
          </Reveal>
        )}

        {step === 2 && (
          <Reveal>
            <h2 className="text-4xl">A che ora?</h2>
            <p className="mt-2 text-[0.88rem] text-ink/50">
              {formatDate(date, { weekday: "long", day: "2-digit", month: "long" })} · {partySize}{" "}
              {partySize === 1 ? "persona" : "persone"}
            </p>

            {loadingSlots ? (
              <div className="mt-10 flex items-center gap-3 text-ink/45">
                <Loader2 className="size-4 animate-spin" /> Verifico la disponibilità…
              </div>
            ) : closedReason ? (
              <div className="mt-8 rounded-2xl border border-flame/25 bg-flame/5 p-6">
                <p className="font-display text-xl text-flame">Chiuso</p>
                <p className="mt-1 text-[0.85rem] text-ink/60">{closedReason}</p>
                <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm mt-4">
                  Scegli un'altra data
                </button>
              </div>
            ) : slots.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-ink/10 bg-white/50 p-6 text-[0.85rem] text-ink/45">
                Nessun orario disponibile per questa data. Prova un altro giorno o chiamaci.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => {
                  const disabled = !slot.available || slot.seatsLeft < partySize;
                  return (
                    <button
                      key={slot.time}
                      onClick={() => setTime(slot.time)}
                      disabled={disabled}
                      className={cn(
                        "relative rounded-xl border py-3 text-center transition-all",
                        time === slot.time
                          ? "border-flame bg-flame text-white"
                          : disabled
                            ? "border-ink/5 text-ink/20 line-through"
                            : "border-ink/10 text-ink/70 hover:border-flame/50",
                      )}
                    >
                      <span className="font-display text-lg tabular-nums">{slot.time}</span>
                      {!disabled && (
                        <span
                          className={cn(
                            "mt-0.5 block text-[0.5rem] tracking-[0.08em] uppercase",
                            time === slot.time ? "text-white/70" : "text-ink/35",
                          )}
                        >
                          {slot.seatsLeft} posti
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Reveal>
        )}

        {step === 3 && (
          <Reveal>
            <h2 className="text-4xl">Dove ti sistemiamo?</h2>
            <p className="mt-2 text-[0.88rem] text-ink/50">
              La preferenza viene registrata, la conferma finale la diamo noi in base ai tavoli.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {AREAS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setArea(option.value)}
                  className={cn(
                    "flex flex-col items-start rounded-2xl border p-5 text-left transition-all",
                    area === option.value
                      ? "border-flame bg-flame/8"
                      : "border-ink/10 bg-white/45 hover:border-flame/35",
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="font-display text-xl">{option.label}</span>
                    <span
                      className={cn(
                        "grid size-5 place-items-center rounded-full border",
                        area === option.value ? "border-flame bg-flame text-white" : "border-ink/20",
                      )}
                    >
                      {area === option.value && <Check className="size-3" />}
                    </span>
                  </span>
                  <span className="mt-1 text-[0.78rem] text-ink/45">{option.hint}</span>
                </button>
              ))}
            </div>
          </Reveal>
        )}

        {step === 4 && (
          <Reveal>
            <h2 className="text-4xl">Ultimi dettagli</h2>
            <p className="mt-2 text-[0.88rem] text-ink/50">
              Ci serve solo un contatto per confermarti il tavolo.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="name">
                  Nome e cognome *
                </label>
                <input
                  id="name"
                  className="field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoComplete="name"
                  placeholder="Mario Rossi"
                />
                {fieldErrors.name && <p className="mt-1 text-[0.7rem] text-flame">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="phone">
                  Telefono *
                </label>
                <input
                  id="phone"
                  className="field"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="333 123 4567"
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-[0.7rem] text-flame">{fieldErrors.phone}</p>
                )}
              </div>
              <div>
                <label className="field-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="field"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  placeholder="mario@email.it"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-[0.7rem] text-flame">{fieldErrors.email}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="occasion">
                  Occasione
                </label>
                <select
                  id="occasion"
                  className="field"
                  value={form.occasion}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                >
                  {OCCASIONS.map((option) => (
                    <option key={option} value={option}>
                      {option || "Nessuna in particolare"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="notes">
                  Allergie, intolleranze o richieste
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="field resize-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Es. allergia alle arachidi, seggiolone, tavolo tranquillo…"
                />
                <p className="mt-1.5 text-[0.68rem] text-ink/40">
                  Segnalare le allergie qui aiuta la cucina, ma ricordati di confermarle anche al
                  personale in sala.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-flame/30 bg-flame/8 px-4 py-3 text-[0.8rem] text-flame">
                {error}
              </div>
            )}
          </Reveal>
        )}

        {step < 5 && (
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="btn btn-ghost btn-sm disabled:opacity-30"
            >
              <ArrowLeft className="size-3.5" />
              Indietro
            </button>
            {step < 4 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="btn btn-clay">
                Continua
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting || !form.name || !form.phone}
                className="btn btn-clay"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Invio…
                  </>
                ) : (
                  <>
                    Invia richiesta
                    <Check className="size-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[1.5rem] border border-ink/10 bg-paper p-5 shadow-[0_20px_60px_-50px_rgba(20,37,30,.45)]">
          <h3 className="text-[0.58rem] font-extrabold tracking-[0.2em] text-ink/35 uppercase">
            La tua prenotazione
          </h3>
          <dl className="mt-4 space-y-3 text-[0.85rem]">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-ink/45">
                <CalendarDays className="size-3.5 text-flame" /> Data
              </dt>
              <dd className="font-semibold">
                {formatDate(date, { weekday: "short", day: "2-digit", month: "short" })}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-ink/45">
                <Clock className="size-3.5 text-flame" /> Ora
              </dt>
              <dd className="font-semibold">{time || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-ink/45">
                <Users className="size-3.5 text-flame" /> Persone
              </dt>
              <dd className="font-semibold">{partySize}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink/45">Zona</dt>
              <dd className="font-semibold capitalize">{area}</dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-ink/10 pt-4 text-[0.7rem] leading-relaxed text-ink/40">
            <p>
              La prenotazione è una <strong className="text-ink/70">richiesta</strong>: ti
              confermiamo noi via telefono o WhatsApp.
            </p>
            <p className="mt-2">
              Coperto {content?.settings.venue?.coperto ?? "2,00 €"}. Per gruppi oltre{" "}
              {settings?.maxParty ?? 12} persone scrivici direttamente.
            </p>
          </div>
        </div>

        <a
          href={`tel:${(content?.settings.venue?.phone ?? "").replace(/\s/g, "")}`}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white/45 py-3 text-[0.68rem] font-bold tracking-[0.1em] text-ink/60 uppercase hover:border-flame/40 hover:text-flame"
        >
          <Phone className="size-3.5" />
          {content?.settings.venue?.phone ?? "0331 519111"}
        </a>
      </aside>
    </div>
  );
}
