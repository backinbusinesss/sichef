import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Phone, Search, Trash2, X, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "../useAdmin";
import { EmptyState, Modal, Spinner, StatCard, Toast, useToast } from "../ui";
import { cn, formatDate, todayIso } from "@/lib/utils";
import type { Reservation } from "@/lib/types";

const STATUSES = [
  { value: "all", label: "Tutte" },
  { value: "pending", label: "Da confermare" },
  { value: "confirmed", label: "Confermate" },
  { value: "completed", label: "Concluse" },
  { value: "cancelled", label: "Annullate" },
] as const;

const STATUS_STYLE: Record<string, string> = {
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  confirmed: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  cancelled: "border-flame/40 bg-flame/10 text-flame",
  completed: "border-cream/20 bg-cream/5 text-cream/60",
};

export function ReservationsManager() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("status") ?? "all";
  const [status, setStatus] = useState(initial);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast, notify, clear } = useToast();

  const load = async (nextStatus = status) => {
    setLoading(true);
    try {
      const data = await api.get<{ reservations: Reservation[] }>(
        `/api/reservations?status=${nextStatus}`,
      );
      setReservations(data.reservations);
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reservations;
    return reservations.filter((r) =>
      `${r.name} ${r.phone} ${r.email} ${r.date} ${r.notes}`.toLowerCase().includes(q),
    );
  }, [reservations, query]);

  const stats = useMemo(() => {
    const today = todayIso();
    return {
      total: reservations.length,
      pending: reservations.filter((r) => r.status === "pending").length,
      today: reservations.filter((r) => r.date === today && r.status !== "cancelled").length,
      guests: reservations
        .filter((r) => r.date === today && r.status !== "cancelled")
        .reduce((sum, r) => sum + r.partySize, 0),
    };
  }, [reservations]);

  const update = async (reservation: Reservation, patch: Partial<Reservation>) => {
    setSaving(true);
    try {
      const data = await api.patch<{ reservation: Reservation }>(
        `/api/admin/reservations?id=${reservation.id}`,
        patch,
      );
      setReservations((current) =>
        current.map((r) => (r.id === reservation.id ? data.reservation : r)),
      );
      setDetail((current) => (current?.id === reservation.id ? data.reservation : current));
      notify("Prenotazione aggiornata");
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (reservation: Reservation) => {
    if (!window.confirm(`Eliminare la prenotazione di ${reservation.name}?`)) return;
    try {
      await api.delete(`/api/admin/reservations?id=${reservation.id}`);
      setReservations((current) => current.filter((r) => r.id !== reservation.id));
      setDetail(null);
      notify("Prenotazione eliminata");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-bold tracking-[0.24em] text-ember uppercase">Sala</p>
          <h1 className="mt-2 font-display text-3xl">Prenotazioni</h1>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-dim" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca nome, telefono, data…"
            className="admin-field pl-9"
          />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Totale" value={stats.total} />
        <StatCard label="Da confermare" value={stats.pending} accent />
        <StatCard label="Oggi" value={stats.today} />
        <StatCard label="Coperti oggi" value={stats.guests} />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setStatus(option.value);
              setParams(option.value === "all" ? {} : { status: option.value });
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[0.66rem] font-bold tracking-[0.1em] uppercase transition-colors",
              status === option.value
                ? "border-cream bg-cream text-ink"
                : "border-cream/15 text-cream/60 hover:border-cream/35",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid h-40 place-items-center">
          <Spinner className="size-5 text-ember" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nessuna prenotazione"
          description="Quando qualcuno prenota dal sito la vedrai comparire qui in tempo reale."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-cream/10">
          <div className="hidden grid-cols-[5.5rem_1fr_7rem_5rem_7rem_9rem] gap-3 border-b border-cream/10 bg-cream/[0.03] px-4 py-2.5 text-[0.58rem] font-bold tracking-[0.14em] text-dim uppercase lg:grid">
            <span>Data</span>
            <span>Cliente</span>
            <span>Telefono</span>
            <span>Pax</span>
            <span>Stato</span>
            <span className="text-right">Azioni</span>
          </div>
          <ul className="divide-y divide-cream/8">
            {filtered.map((reservation) => (
              <li
                key={reservation.id}
                className="grid cursor-pointer grid-cols-2 gap-3 px-4 py-3 transition-colors hover:bg-cream/[0.03] lg:grid-cols-[5.5rem_1fr_7rem_5rem_7rem_9rem] lg:items-center"
                onClick={() => {
                  setDetail(reservation);
                  setAdminNotes(reservation.adminNotes ?? "");
                }}
              >
                <div>
                  <p className="text-[0.7rem] font-bold tracking-[0.06em] text-ember uppercase lg:hidden">
                    Data
                  </p>
                  <p className="text-[0.82rem]">{formatDate(reservation.date, { day: "2-digit", month: "short" })}</p>
                  <p className="font-display text-sm tabular-nums">{reservation.time}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[0.85rem] font-semibold">{reservation.name}</p>
                  <p className="truncate text-[0.66rem] text-dim">
                    {reservation.area}
                    {reservation.occasion && ` · ${reservation.occasion}`}
                  </p>
                </div>
                <p className="text-[0.78rem] text-cream/75">{reservation.phone}</p>
                <p className="text-[0.82rem] tabular-nums">{reservation.partySize}</p>
                <span
                  className={cn(
                    "w-fit rounded-full border px-2 py-0.5 text-[0.56rem] font-bold tracking-[0.1em] uppercase",
                    STATUS_STYLE[reservation.status],
                  )}
                >
                  {reservation.status}
                </span>
                <div className="flex justify-end gap-1.5">
                  {reservation.status === "pending" && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        void update(reservation, { status: "confirmed" });
                      }}
                      className="grid size-8 place-items-center rounded-lg border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10"
                      aria-label="Conferma"
                    >
                      <Check className="size-3.5" />
                    </button>
                  )}
                  <a
                    href={`tel:${reservation.phone.replace(/\s/g, "")}`}
                    onClick={(event) => event.stopPropagation()}
                    className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/60 hover:border-ember/50 hover:text-ember"
                    aria-label="Chiama"
                  >
                    <Phone className="size-3.5" />
                  </a>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      void remove(reservation);
                    }}
                    className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/50 hover:border-flame/50 hover:text-flame"
                    aria-label="Elimina"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `Prenotazione · ${detail.name}` : ""}
      >
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-cream/10 bg-cream/[0.03] p-3">
                <p className="text-[0.55rem] tracking-[0.14em] text-dim uppercase">Data</p>
                <p className="mt-1 text-[0.82rem]">{formatDate(detail.date)}</p>
              </div>
              <div className="rounded-xl border border-cream/10 bg-cream/[0.03] p-3">
                <p className="text-[0.55rem] tracking-[0.14em] text-dim uppercase">Ora</p>
                <p className="mt-1 text-[0.82rem]">{detail.time}</p>
              </div>
              <div className="rounded-xl border border-cream/10 bg-cream/[0.03] p-3">
                <p className="text-[0.55rem] tracking-[0.14em] text-dim uppercase">Persone</p>
                <p className="mt-1 text-[0.82rem]">{detail.partySize}</p>
              </div>
              <div className="rounded-xl border border-cream/10 bg-cream/[0.03] p-3">
                <p className="text-[0.55rem] tracking-[0.14em] text-dim uppercase">Zona</p>
                <p className="mt-1 text-[0.82rem] capitalize">{detail.area}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-[0.82rem]">
              <p>
                <span className="text-dim">Telefono: </span>
                <a href={`tel:${detail.phone}`} className="text-ember hover:underline">
                  {detail.phone}
                </a>
              </p>
              {detail.email && (
                <p>
                  <span className="text-dim">Email: </span>
                  <a href={`mailto:${detail.email}`} className="hover:underline">
                    {detail.email}
                  </a>
                </p>
              )}
              {detail.occasion && (
                <p>
                  <span className="text-dim">Occasione: </span>
                  {detail.occasion}
                </p>
              )}
              {detail.notes && (
                <p className="rounded-xl border border-ember/25 bg-ember/8 p-3 text-[0.8rem]">
                  <span className="font-bold text-ember">Note cliente: </span>
                  {detail.notes}
                </p>
              )}
              <p className="text-[0.66rem] text-dim/70">Ricevuta il {new Date(detail.createdAt).toLocaleString("it-IT")}</p>
            </div>

            <div>
              <label className="admin-label" htmlFor="admin-notes">
                Note interne
              </label>
              <textarea
                id="admin-notes"
                rows={3}
                className="admin-field resize-none"
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                placeholder="Tavolo 12, allergia arachidi, arrivo in ritardo…"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["confirmed", "completed", "cancelled"] as const).map((value) => (
                <button
                  key={value}
                  disabled={saving}
                  onClick={() => void update(detail, { status: value, adminNotes })}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[0.62rem] font-bold tracking-[0.1em] uppercase transition-colors",
                    detail.status === value
                      ? "border-cream bg-cream text-ink"
                      : "border-cream/20 text-cream/70 hover:border-cream/45",
                  )}
                >
                  {value === "confirmed" ? "Conferma" : value === "completed" ? "Conclusa" : "Annulla"}
                </button>
              ))}
              <button
                disabled={saving}
                onClick={() => void update(detail, { adminNotes })}
                className="ml-auto rounded-full border border-ember/40 bg-ember/10 px-3.5 py-1.5 text-[0.62rem] font-bold tracking-[0.1em] text-ember uppercase"
              >
                Salva note
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-cream/10 pt-4">
              <a
                href={`https://wa.me/${detail.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-400/30 px-3 py-2 text-[0.68rem] font-bold text-emerald-200 uppercase hover:bg-emerald-400/10"
              >
                <MessageCircle className="size-3.5" /> WhatsApp
              </a>
              <button
                onClick={() => void remove(detail)}
                className="flex items-center gap-1.5 rounded-lg border border-flame/30 px-3 py-2 text-[0.68rem] font-bold text-flame uppercase hover:bg-flame/10"
              >
                <X className="size-3.5" /> Elimina
              </button>
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </div>
  );
}
