import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, Inbox, Phone, ShoppingBag, Users } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminSection } from "../AdminApp";
import { errorMessage } from "../useAdmin";
import { EmptyState, Spinner, StatCard, Toast, useToast } from "../ui";
import { cn, euro, formatDate } from "@/lib/utils";

type DashboardData = {
  today: {
    id: string; name: string; phone: string; partySize: number; time: string;
    area: string; status: string; notes: string; occasion: string;
  }[];
  upcoming: {
    id: string; name: string; phone: string; partySize: number; date: string;
    time: string; area: string; status: string;
  }[];
  recentOrders: {
    id: string; code: string; name: string; phone: string; fulfilment: string;
    pickupTime: string; total: number; status: string; createdAt: string;
  }[];
  recentMessages: { id: string; name: string; subject: string; createdAt: string }[];
  stats: {
    today_count: number; today_guests: number; pending: number; month_count: number;
    newsletter: number; ordersToday: number; ordersActive: number; revenueToday: number;
    ordersTotal: number; messagesNew: number; messagesTotal: number;
    loyaltyMembers: number; loyaltyPoints: number;
  };
  topItems: { name: string; count: number; quantity: number }[];
};

const STATUS_STYLE: Record<string, string> = {
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  confirmed: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  preparing: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  ready: "border-indigo-400/40 bg-indigo-400/10 text-indigo-200",
  delivering: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  completed: "border-cream/20 bg-cream/5 text-cream/70",
  cancelled: "border-flame/40 bg-flame/10 text-flame",
};

export function Dashboard({ onNavigate }: { onNavigate: (section: AdminSection) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast, notify, clear } = useToast();

  const load = async () => {
    try {
      setData(await api.get<DashboardData>("/api/admin/dashboard"));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const setStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/admin/reservations?id=${id}`, { status });
      notify("Stato aggiornato");
      void load();
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  if (loading) {
    return <div className="grid h-64 place-items-center"><Spinner className="size-5 text-ember" /></div>;
  }
  if (error || !data) {
    return <EmptyState title="Errore" description={error ?? "Dati non disponibili."} />;
  }

  const todayLabel = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-bold tracking-[0.24em] text-ember uppercase">{todayLabel}</p>
          <h1 className="mt-2 font-display text-3xl">Buon servizio.</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate("orders")} className="btn btn-ghost btn-sm">Ordini <ArrowRight className="size-3.5" /></button>
          <button onClick={() => onNavigate("reservations")} className="btn btn-ghost btn-sm">Prenotazioni <ArrowRight className="size-3.5" /></button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tavoli oggi" value={data.stats.today_count} hint={`${data.stats.today_guests} coperti`} accent />
        <StatCard label="Ordini oggi" value={data.stats.ordersToday} hint={`${euro(data.stats.revenueToday)} incassati`} />
        <StatCard label="Da gestire" value={data.stats.pending + data.stats.ordersActive} hint={`${data.stats.pending} prenotazioni · ${data.stats.ordersActive} ordini`} />
        <StatCard label="Messaggi nuovi" value={data.stats.messagesNew} hint={`${data.stats.messagesTotal} totali`} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fedeltà" value={data.stats.loyaltyMembers} hint={`${data.stats.loyaltyPoints} punti attivi`} />
        <StatCard label="Questo mese" value={data.stats.month_count} hint="Prenotazioni totali" />
        <StatCard label="Newsletter" value={data.stats.newsletter} hint="Iscritti" />
        <StatCard label="Ordini totali" value={data.stats.ordersTotal} hint="Da quando è online" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-cream/10 bg-cream/[0.02]">
          <div className="flex items-center justify-between border-b border-cream/10 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.16em] uppercase"><CalendarClock className="size-3.5 text-ember" /> Servizio di oggi</h2>
            <span className="text-[0.62rem] text-dim">{data.today.length} prenotazioni</span>
          </div>
          {data.today.length === 0 ? (
            <p className="px-5 py-10 text-center text-[0.82rem] text-dim">Nessuna prenotazione per oggi.</p>
          ) : (
            <ul className="divide-y divide-cream/8">
              {data.today.map((reservation) => (
                <li key={reservation.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className="w-12 font-display text-lg tabular-nums">{reservation.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.86rem] font-semibold">{reservation.name}</p>
                    <p className="flex items-center gap-2 text-[0.68rem] text-dim"><Users className="size-3" /> {reservation.partySize} · {reservation.area}{reservation.occasion && ` · ${reservation.occasion}`}</p>
                  </div>
                  <a href={`tel:${reservation.phone.replace(/\s/g, "")}`} className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/60 hover:border-ember/50 hover:text-ember" aria-label={`Chiama ${reservation.name}`}><Phone className="size-3.5" /></a>
                  <span className={cn("rounded-full border px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.1em] uppercase", STATUS_STYLE[reservation.status])}>{reservation.status}</span>
                  {reservation.status === "pending" && (
                    <button onClick={() => setStatus(reservation.id, "confirmed")} className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.1em] text-emerald-200 uppercase hover:bg-emerald-400/25">Conferma</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-cream/10 bg-cream/[0.02]">
          <div className="flex items-center justify-between border-b border-cream/10 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.16em] uppercase"><ShoppingBag className="size-3.5 text-ember" /> Ultimi ordini</h2>
            <button onClick={() => onNavigate("orders")} className="text-[0.6rem] font-bold tracking-[0.1em] text-ember uppercase">Vedi tutti</button>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-[0.82rem] text-dim">Nessun ordine ancora.</p>
          ) : (
            <ul className="divide-y divide-cream/8">
              {data.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.82rem] font-semibold">{order.code} · {order.name}</p>
                    <p className="text-[0.64rem] text-dim">{order.fulfilment === "pickup" ? "Ritiro" : "Consegna"} · {order.pickupTime}</p>
                  </div>
                  <span className="font-display text-base text-ember">{euro(order.total)}</span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[0.52rem] font-bold tracking-[0.08em] uppercase", STATUS_STYLE[order.status])}>{order.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-cream/10 bg-cream/[0.02]">
          <div className="flex items-center justify-between border-b border-cream/10 px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.16em] uppercase"><Inbox className="size-3.5 text-ember" /> Messaggi recenti</h2>
            <button onClick={() => onNavigate("messages")} className="text-[0.6rem] font-bold tracking-[0.1em] text-ember uppercase">Apri inbox</button>
          </div>
          {data.recentMessages.length === 0 ? (
            <p className="px-5 py-8 text-center text-[0.82rem] text-dim">Nessun messaggio.</p>
          ) : (
            <ul className="divide-y divide-cream/8">
              {data.recentMessages.map((message) => (
                <li key={message.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[0.82rem] font-semibold">{message.name}</p>
                    <p className="truncate text-[0.64rem] text-dim">{message.subject}</p>
                  </div>
                  <span className="shrink-0 text-[0.6rem] text-dim">{new Date(message.createdAt).toLocaleDateString("it-IT")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-5">
          <h2 className="text-[0.7rem] font-bold tracking-[0.16em] uppercase">I più ordinati</h2>
          {data.topItems.length === 0 ? (
            <p className="mt-4 text-[0.8rem] text-dim">Ancora nessun dato: comparirà dopo i primi ordini.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {data.topItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-cream/8 px-3.5 py-2.5">
                  <span className="truncate text-[0.82rem]">{item.name}</span>
                  <span className="font-display text-lg text-ember">{item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-cream/10 bg-cream/[0.02]">
        <div className="border-b border-cream/10 px-5 py-3.5">
          <h2 className="text-[0.7rem] font-bold tracking-[0.16em] uppercase">Prossimi arrivi</h2>
        </div>
        {data.upcoming.length === 0 ? (
          <p className="px-5 py-8 text-center text-[0.82rem] text-dim">Nessun arrivo in calendario.</p>
        ) : (
          <ul className="divide-y divide-cream/8">
            {data.upcoming.map((reservation) => (
              <li key={reservation.id} className="flex items-center gap-3 px-5 py-2.5">
                <div className="w-14 shrink-0">
                  <p className="text-[0.62rem] font-bold tracking-[0.08em] text-ember uppercase">{formatDate(reservation.date, { day: "2-digit", month: "short" })}</p>
                  <p className="font-display text-sm tabular-nums">{reservation.time}</p>
                </div>
                <p className="min-w-0 flex-1 truncate text-[0.82rem]">{reservation.name}</p>
                <span className="text-[0.65rem] text-dim">{reservation.partySize} persone</span>
                <span className={cn("size-2 rounded-full", reservation.status === "confirmed" ? "bg-emerald-400" : "bg-amber-400")} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </div>
  );
}
