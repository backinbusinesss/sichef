import { useEffect, useMemo, useState } from "react";
import { Gift, Loader2, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "../useAdmin";
import { EmptyState, Modal, Spinner, StatCard, Toast, useToast } from "../ui";
import { cn } from "@/lib/utils";

type Member = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  points: number;
  isActive: boolean;
  createdAt: string;
  transactions: number;
};

export function LoyaltyManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pointsFor, setPointsFor] = useState<Member | null>(null);
  const [pointsForm, setPointsForm] = useState({ pointsDelta: "10", reason: "Punti da consumazione" });
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", phone: "", birthday: "", points: "0" });
  const [saving, setSaving] = useState(false);
  const { toast, notify, clear } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ members: Member[] }>("/api/admin/loyalty");
      setMembers(data.members);
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((member) => `${member.name} ${member.email} ${member.code} ${member.phone}`.toLowerCase().includes(q));
  }, [members, query]);

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter((member) => member.isActive).length,
    points: members.reduce((sum, member) => sum + member.points, 0),
    rewards: Math.floor(members.reduce((sum, member) => sum + member.points, 0) / 100),
  }), [members]);

  const applyPoints = async () => {
    if (!pointsFor) return;
    setSaving(true);
    try {
      const data = await api.patch<{ member: Member }>(`/api/admin/loyalty?id=${pointsFor.id}`, {
        pointsDelta: Number(pointsForm.pointsDelta) || 0,
        reason: pointsForm.reason,
      });
      setMembers((current) => current.map((member) => (member.id === pointsFor.id ? { ...data.member, transactions: member.transactions + 1 } : member)));
      notify("Punti aggiornati");
      setPointsFor(null);
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (member: Member) => {
    try {
      const data = await api.patch<{ member: Member }>(`/api/admin/loyalty?id=${member.id}`, { isActive: !member.isActive });
      setMembers((current) => current.map((item) => (item.id === member.id ? data.member : item)));
      notify(member.isActive ? "Tessera disattivata" : "Tessera attivata");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  const remove = async (member: Member) => {
    if (!window.confirm(`Eliminare la tessera di ${member.name}?`)) return;
    try {
      await api.delete(`/api/admin/loyalty?id=${member.id}`);
      setMembers((current) => current.filter((item) => item.id !== member.id));
      notify("Tessera eliminata");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  const createMember = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await api.post<{ member: Member }>("/api/admin/loyalty", {
        ...createForm,
        points: Number(createForm.points) || 0,
      });
      setMembers((current) => [data.member, ...current]);
      setCreateOpen(false);
      setCreateForm({ name: "", email: "", phone: "", birthday: "", points: "0" });
      notify("Tessera creata");
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-bold tracking-[0.24em] text-ember uppercase">Programma fedeltà</p>
          <h1 className="mt-2 font-display text-3xl">Tessere e punti</h1>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-dim" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca nome, email, codice…" className="admin-field pl-9" />
          </div>
          <button onClick={() => setCreateOpen(true)} className="btn btn-flame btn-sm shrink-0"><Plus className="size-3.5" /> Nuova</button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Tessere" value={stats.total} />
        <StatCard label="Attive" value={stats.active} accent />
        <StatCard label="Punti totali" value={stats.points} />
        <StatCard label="Premi maturati" value={stats.rewards} hint="100 punti = 10 €" />
      </div>

      {loading ? (
        <div className="grid h-40 place-items-center"><Spinner className="size-5 text-ember" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nessuna tessera" description="Le iscrizioni dal sito compariranno qui. Puoi anche crearne una manualmente alla cassa." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-cream/10">
          <div className="hidden grid-cols-[8rem_1fr_8rem_6rem_7rem_8rem] gap-3 border-b border-cream/10 bg-cream/[0.03] px-4 py-2.5 text-[0.58rem] font-bold tracking-[0.14em] text-dim uppercase lg:grid">
            <span>Codice</span><span>Cliente</span><span>Email</span><span>Punti</span><span>Attiva</span><span className="text-right">Azioni</span>
          </div>
          <ul className="divide-y divide-cream/8">
            {filtered.map((member) => (
              <li key={member.id} className="grid gap-3 px-4 py-3 lg:grid-cols-[8rem_1fr_8rem_6rem_7rem_8rem] lg:items-center">
                <span className="font-mono text-[0.74rem] font-bold text-ember">{member.code}</span>
                <div className="min-w-0">
                  <p className="truncate text-[0.85rem] font-semibold">{member.name}</p>
                  <p className="truncate text-[0.64rem] text-dim">{member.phone || "—"}</p>
                </div>
                <span className="truncate text-[0.72rem] text-cream/70">{member.email}</span>
                <span className="font-display text-xl text-ember">{member.points}</span>
                <button onClick={() => void toggleActive(member)} className={cn("flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.56rem] font-bold tracking-[0.08em] uppercase", member.isActive ? "border-emerald-400/30 text-emerald-200" : "border-cream/15 text-cream/45")}>
                  {member.isActive ? <ToggleRight className="size-3.5" /> : <ToggleLeft className="size-3.5" />}
                  {member.isActive ? "Attiva" : "Sospesa"}
                </button>
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => { setPointsFor(member); setPointsForm({ pointsDelta: "10", reason: "Punti da consumazione" }); }} className="grid size-8 place-items-center rounded-lg border border-ember/30 text-ember hover:bg-ember/10" aria-label="Gestisci punti"><Gift className="size-3.5" /></button>
                  <button onClick={() => void remove(member)} className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/50 hover:border-flame/50 hover:text-flame" aria-label="Elimina"><Trash2 className="size-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal open={Boolean(pointsFor)} onClose={() => setPointsFor(null)} title={pointsFor ? `Punti · ${pointsFor.name}` : ""} size="sm">
        {pointsFor && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-cream/10 bg-cream/[0.03] p-4">
              <div>
                <p className="text-[0.58rem] tracking-[0.14em] text-dim uppercase">Saldo attuale</p>
                <p className="mt-1 font-display text-3xl text-ember">{pointsFor.points}</p>
              </div>
              <span className="font-mono text-[0.72rem] text-cream/60">{pointsFor.code}</span>
            </div>
            <div>
              <label className="admin-label" htmlFor="points-delta">Variazione punti (usa - per togliere)</label>
              <input id="points-delta" type="number" className="admin-field" value={pointsForm.pointsDelta} onChange={(event) => setPointsForm({ ...pointsForm, pointsDelta: event.target.value })} />
            </div>
            <div>
              <label className="admin-label" htmlFor="points-reason">Motivo</label>
              <input id="points-reason" className="admin-field" value={pointsForm.reason} onChange={(event) => setPointsForm({ ...pointsForm, reason: event.target.value })} />
            </div>
            <button disabled={saving} onClick={() => void applyPoints()} className="btn btn-flame w-full">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Gift className="size-4" />}
              Aggiorna punti
            </button>
          </div>
        )}
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuova tessera" size="sm">
        <form onSubmit={createMember} className="space-y-4">
          <div>
            <label className="admin-label" htmlFor="new-name">Nome e cognome *</label>
            <input id="new-name" required className="admin-field" value={createForm.name} onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })} />
          </div>
          <div>
            <label className="admin-label" htmlFor="new-email">Email *</label>
            <input id="new-email" type="email" required className="admin-field" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="admin-label" htmlFor="new-phone">Telefono</label>
              <input id="new-phone" className="admin-field" value={createForm.phone} onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })} />
            </div>
            <div>
              <label className="admin-label" htmlFor="new-points">Punti iniziali</label>
              <input id="new-points" type="number" min={0} className="admin-field" value={createForm.points} onChange={(event) => setCreateForm({ ...createForm, points: event.target.value })} />
            </div>
          </div>
          <div>
            <label className="admin-label" htmlFor="new-birthday">Compleanno</label>
            <input id="new-birthday" type="date" className="admin-field" value={createForm.birthday} onChange={(event) => setCreateForm({ ...createForm, birthday: event.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn btn-flame w-full">{saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Crea tessera</button>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </div>
  );
}
