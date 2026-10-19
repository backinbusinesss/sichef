import { useEffect, useMemo, useState } from "react";
import { Bike, Check, Eye, Phone, Search, Store, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "../useAdmin";
import { EmptyState, Modal, Spinner, StatCard, Toast, useToast } from "../ui";
import { cn, euro } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Tutti" },
  { value: "pending", label: "Nuovi" },
  { value: "confirmed", label: "Confermati" },
  { value: "preparing", label: "In preparazione" },
  { value: "ready", label: "Pronti" },
  { value: "delivering", label: "In consegna" },
  { value: "completed", label: "Conclusi" },
  { value: "cancelled", label: "Annullati" },
];

const STATUS_STYLE: Record<string, string> = {
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  confirmed: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  preparing: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  ready: "border-indigo-400/40 bg-indigo-400/10 text-indigo-200",
  delivering: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  completed: "border-cream/20 bg-cream/5 text-cream/60",
  cancelled: "border-flame/40 bg-flame/10 text-flame",
};

export function OrdersManager() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast, notify, clear } = useToast();

  const load = async (nextStatus = status) => {
    setLoading(true);
    try {
      const data = await api.get<{ orders: Order[] }>(`/api/admin/orders?status=${nextStatus}`);
      setOrders(data.orders);
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(status); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) => `${order.code} ${order.name} ${order.phone} ${order.address}`.toLowerCase().includes(q));
  }, [orders, query]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    active: orders.filter((order) => ["confirmed", "preparing", "ready", "delivering"].includes(order.status)).length,
    revenue: orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0),
  }), [orders]);

  const update = async (order: Order, patch: Partial<Order>) => {
    setSaving(true);
    try {
      const data = await api.patch<{ order: Order }>(`/api/admin/orders?id=${order.id}`, patch);
      setOrders((current) => current.map((item) => (item.id === order.id ? data.order : item)));
      setDetail((current) => (current?.id === order.id ? data.order : current));
      notify("Ordine aggiornato");
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (order: Order) => {
    if (!window.confirm(`Eliminare l'ordine ${order.code}?`)) return;
    try {
      await api.delete(`/api/admin/orders?id=${order.id}`);
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setDetail(null);
      notify("Ordine eliminato");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-bold tracking-[0.24em] text-ember uppercase">Asporto & domicilio</p>
          <h1 className="mt-2 font-display text-3xl">Ordini</h1>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-dim" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca codice, nome, telefono…" className="admin-field pl-9" />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Totale" value={stats.total} />
        <StatCard label="Nuovi" value={stats.pending} accent />
        <StatCard label="In corso" value={stats.active} />
        <StatCard label="Valore" value={euro(stats.revenue)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((option) => (
          <button key={option.value} onClick={() => setStatus(option.value)} className={cn("rounded-full border px-3.5 py-1.5 text-[0.62rem] font-bold tracking-[0.08em] uppercase transition-colors", status === option.value ? "border-cream bg-cream text-ink" : "border-cream/15 text-cream/60 hover:border-cream/35")}>
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid h-40 place-items-center"><Spinner className="size-5 text-ember" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nessun ordine" description="Gli ordini inviati dal sito compariranno qui in tempo reale." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-cream/10">
          <div className="hidden grid-cols-[7rem_1fr_7rem_6rem_6rem_10rem] gap-3 border-b border-cream/10 bg-cream/[0.03] px-4 py-2.5 text-[0.58rem] font-bold tracking-[0.14em] text-dim uppercase lg:grid">
            <span>Codice</span><span>Cliente</span><span>Orario</span><span>Totale</span><span>Stato</span><span className="text-right">Azioni</span>
          </div>
          <ul className="divide-y divide-cream/8">
            {filtered.map((order) => (
              <li key={order.id} className="grid cursor-pointer grid-cols-2 gap-3 px-4 py-3 transition-colors hover:bg-cream/[0.03] lg:grid-cols-[7rem_1fr_7rem_6rem_6rem_10rem] lg:items-center" onClick={() => { setDetail(order); setAdminNotes(order.adminNotes ?? ""); }}>
                <div>
                  <p className="font-mono text-[0.76rem] font-bold text-ember">{order.code}</p>
                  <p className="text-[0.6rem] text-dim">{new Date(order.createdAt).toLocaleDateString("it-IT")}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[0.85rem] font-semibold">{order.name}</p>
                  <p className="flex items-center gap-1.5 text-[0.64rem] text-dim">{order.fulfilment === "pickup" ? <Store className="size-3" /> : <Bike className="size-3" />}{order.fulfilment === "pickup" ? "Ritiro" : "Consegna"}{order.address ? ` · ${order.address}` : ""}</p>
                </div>
                <p className="text-[0.78rem] text-cream/75">{order.pickupTime}</p>
                <p className="text-[0.82rem] font-semibold tabular-nums">{euro(order.total)}</p>
                <span className={cn("w-fit rounded-full border px-2 py-0.5 text-[0.54rem] font-bold tracking-[0.08em] uppercase", STATUS_STYLE[order.status])}>{order.status}</span>
                <div className="flex justify-end gap-1.5">
                  {order.status === "pending" && (
                    <button onClick={(event) => { event.stopPropagation(); void update(order, { status: "confirmed" }); }} className="grid size-8 place-items-center rounded-lg border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10" aria-label="Conferma"><Check className="size-3.5" /></button>
                  )}
                  <a href={`tel:${order.phone.replace(/\s/g, "")}`} onClick={(event) => event.stopPropagation()} className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/60 hover:border-ember/50 hover:text-ember" aria-label="Chiama"><Phone className="size-3.5" /></a>
                  <button onClick={(event) => { event.stopPropagation(); setDetail(order); setAdminNotes(order.adminNotes ?? ""); }} className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/60 hover:border-ember/50 hover:text-ember" aria-label="Dettagli"><Eye className="size-3.5" /></button>
                  <button onClick={(event) => { event.stopPropagation(); void remove(order); }} className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/50 hover:border-flame/50 hover:text-flame" aria-label="Elimina"><Trash2 className="size-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail ? `Ordine ${detail.code}` : ""} size="md">
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className={cn("rounded-full border px-3 py-1 text-[0.6rem] font-bold tracking-[0.1em] uppercase", STATUS_STYLE[detail.status])}>{detail.status}</span>
              <span className="rounded-full border border-cream/15 px-3 py-1 text-[0.6rem] font-bold tracking-[0.1em] uppercase text-cream/65">{detail.fulfilment === "pickup" ? "Ritiro" : "Consegna"}</span>
              <span className="rounded-full border border-cream/15 px-3 py-1 text-[0.6rem] font-bold tracking-[0.1em] uppercase text-cream/65">{detail.pickupTime}</span>
            </div>

            <div className="space-y-1.5 text-[0.82rem]">
              <p><span className="text-dim">Cliente: </span>{detail.name}</p>
              <p><span className="text-dim">Telefono: </span><a href={`tel:${detail.phone}`} className="text-ember hover:underline">{detail.phone}</a></p>
              {detail.email && <p><span className="text-dim">Email: </span><a href={`mailto:${detail.email}`} className="hover:underline">{detail.email}</a></p>}
              {detail.address && <p><span className="text-dim">Indirizzo: </span>{detail.address}</p>}
              {detail.notes && <p className="rounded-xl border border-ember/25 bg-ember/8 p-3 text-[0.8rem]"><span className="font-bold text-ember">Note cliente: </span>{detail.notes}</p>}
            </div>

            <div className="rounded-xl border border-cream/10 bg-cream/[0.03] p-4">
              <h3 className="text-[0.6rem] font-bold tracking-[0.14em] text-dim uppercase">Righe ordine</h3>
              <ul className="mt-3 space-y-2">
                {detail.items.map((item) => (
                  <li key={item.id ?? item.name} className="flex items-center justify-between gap-3 text-[0.82rem]">
                    <span>{item.quantity} × {item.name}</span>
                    <span className="tabular-nums">{euro(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1 border-t border-cream/10 pt-3 text-[0.78rem]">
                <div className="flex justify-between text-dim"><span>Subtotale</span><span>{euro(detail.subtotal)}</span></div>
                {detail.deliveryFee > 0 && <div className="flex justify-between text-dim"><span>Consegna</span><span>{euro(detail.deliveryFee)}</span></div>}
                <div className="flex justify-between font-display text-lg"><span>Totale</span><span className="text-ember">{euro(detail.total)}</span></div>
              </div>
            </div>

            <div>
              <label className="admin-label" htmlFor="order-admin-notes">Note interne</label>
              <textarea id="order-admin-notes" rows={3} className="admin-field resize-none" value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} placeholder="Numero tavolo, allergie, orario concordato…" />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["confirmed", "preparing", "ready", "delivering", "completed", "cancelled"] as OrderStatus[]).map((value) => (
                <button key={value} disabled={saving} onClick={() => void update(detail, { status: value, adminNotes })} className={cn("rounded-full border px-3 py-1.5 text-[0.58rem] font-bold tracking-[0.08em] uppercase transition-colors", detail.status === value ? "border-cream bg-cream text-ink" : "border-cream/20 text-cream/65 hover:border-cream/45")}>
                  {value}
                </button>
              ))}
              <button disabled={saving} onClick={() => void update(detail, { adminNotes })} className="ml-auto rounded-full border border-ember/40 bg-ember/10 px-3.5 py-1.5 text-[0.6rem] font-bold tracking-[0.1em] text-ember uppercase">Salva note</button>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-cream/10 pt-4">
              <a href={`https://wa.me/${detail.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-emerald-400/30 px-3 py-2 text-[0.66rem] font-bold text-emerald-200 uppercase hover:bg-emerald-400/10">WhatsApp</a>
              <button onClick={() => void remove(detail)} className="flex items-center gap-1.5 rounded-lg border border-flame/30 px-3 py-2 text-[0.66rem] font-bold text-flame uppercase hover:bg-flame/10"><Trash2 className="size-3.5" /> Elimina</button>
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </div>
  );
}
