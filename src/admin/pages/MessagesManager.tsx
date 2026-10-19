import { useEffect, useMemo, useState } from "react";
import { Archive, Check, Mail, Phone, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "../useAdmin";
import { EmptyState, Modal, Spinner, StatCard, Toast, useToast } from "../ui";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/lib/types";

const STATUSES: { value: ContactMessage["status"] | "all"; label: string }[] = [
  { value: "all", label: "Tutti" },
  { value: "new", label: "Nuovi" },
  { value: "read", label: "Letti" },
  { value: "replied", label: "Risposti" },
  { value: "archived", label: "Archiviati" },
];

const STATUS_STYLE: Record<string, string> = {
  new: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  read: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  replied: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  archived: "border-cream/20 bg-cream/5 text-cream/60",
};

export function MessagesManager() {
  const [status, setStatus] = useState<ContactMessage["status"] | "all">("all");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<ContactMessage | null>(null);
  const { toast, notify, clear } = useToast();

  const load = async (nextStatus = status) => {
    setLoading(true);
    try {
      const data = await api.get<{ messages: ContactMessage[] }>(`/api/admin/messages?status=${nextStatus}`);
      setMessages(data.messages);
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(status); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((message) => `${message.name} ${message.email} ${message.phone} ${message.subject} ${message.message}`.toLowerCase().includes(q));
  }, [messages, query]);

  const update = async (message: ContactMessage, nextStatus: ContactMessage["status"]) => {
    try {
      const data = await api.patch<{ message: ContactMessage }>(`/api/admin/messages?id=${message.id}`, { status: nextStatus });
      setMessages((current) => current.map((item) => (item.id === message.id ? data.message : item)));
      setDetail((current) => (current?.id === message.id ? data.message : current));
      notify("Messaggio aggiornato");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  const remove = async (message: ContactMessage) => {
    if (!window.confirm(`Eliminare il messaggio di ${message.name}?`)) return;
    try {
      await api.delete(`/api/admin/messages?id=${message.id}`);
      setMessages((current) => current.filter((item) => item.id !== message.id));
      setDetail(null);
      notify("Messaggio eliminato");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-bold tracking-[0.24em] text-ember uppercase">Contatti</p>
          <h1 className="mt-2 font-display text-3xl">Messaggi</h1>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-dim" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca nome, email, oggetto…" className="admin-field pl-9" />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Totale" value={messages.length} />
        <StatCard label="Nuovi" value={messages.filter((message) => message.status === "new").length} accent />
        <StatCard label="Risposti" value={messages.filter((message) => message.status === "replied").length} />
        <StatCard label="Archiviati" value={messages.filter((message) => message.status === "archived").length} />
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
        <EmptyState title="Nessun messaggio" description="I messaggi del form contatti compariranno qui." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((message) => (
            <li key={message.id}>
              <button onClick={() => { setDetail(message); if (message.status === "new") void update(message, "read"); }} className="flex w-full flex-col gap-2 rounded-2xl border border-cream/10 bg-cream/[0.02] p-4 text-left transition-colors hover:border-cream/25 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.86rem] font-semibold">{message.name}</p>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[0.52rem] font-bold tracking-[0.08em] uppercase", STATUS_STYLE[message.status])}>{message.status}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[0.72rem] text-dim">{message.subject || message.email}</p>
                  <p className="mt-1 line-clamp-1 text-[0.76rem] text-cream/60">{message.message}</p>
                </div>
                <span className="shrink-0 text-[0.6rem] text-dim">{new Date(message.createdAt).toLocaleString("it-IT")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail ? detail.subject || "Messaggio" : ""} size="md">
        {detail && (
          <div className="space-y-5">
            <div className="space-y-1.5 text-[0.82rem]">
              <p><span className="text-dim">Da: </span>{detail.name}</p>
              <p><span className="text-dim">Email: </span><a href={`mailto:${detail.email}`} className="text-ember hover:underline">{detail.email}</a></p>
              {detail.phone && <p><span className="text-dim">Telefono: </span><a href={`tel:${detail.phone}`} className="hover:underline">{detail.phone}</a></p>}
              <p className="text-[0.66rem] text-dim/70">Ricevuto il {new Date(detail.createdAt).toLocaleString("it-IT")}</p>
            </div>

            <div className="whitespace-pre-wrap rounded-xl border border-cream/10 bg-cream/[0.03] p-4 text-[0.85rem] leading-relaxed">{detail.message}</div>

            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${detail.email}?subject=Re: ${encodeURIComponent(detail.subject || "Ristorante Sì Chef")}`} className="flex items-center gap-1.5 rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-[0.66rem] font-bold text-ember uppercase hover:bg-ember/20"><Mail className="size-3.5" /> Rispondi</a>
              {detail.phone && <a href={`https://wa.me/${detail.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-emerald-400/30 px-3 py-2 text-[0.66rem] font-bold text-emerald-200 uppercase hover:bg-emerald-400/10"><Phone className="size-3.5" /> WhatsApp</a>}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-cream/10 pt-4">
              {(["read", "replied", "archived"] as ContactMessage["status"][]).map((value) => (
                <button key={value} onClick={() => void update(detail, value)} className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.58rem] font-bold tracking-[0.08em] uppercase transition-colors", detail.status === value ? "border-cream bg-cream text-ink" : "border-cream/20 text-cream/65 hover:border-cream/45")}>
                  {value === "read" ? <Check className="size-3" /> : <Archive className="size-3" />}
                  {value}
                </button>
              ))}
              <button onClick={() => void remove(detail)} className="ml-auto flex items-center gap-1.5 rounded-lg border border-flame/30 px-3 py-2 text-[0.64rem] font-bold text-flame uppercase hover:bg-flame/10"><Trash2 className="size-3.5" /> Elimina</button>
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </div>
  );
}
