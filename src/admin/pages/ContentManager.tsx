import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, ImagePlus, Loader2, CalendarOff, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, useUpload } from "../useAdmin";
import { EmptyState, Modal, Spinner, Toast, Toggle, useToast } from "../ui";
import { cn, formatDate } from "@/lib/utils";
import type { AdminEvent, AdminGallery, AdminPromo } from "@/lib/types";

type Tab = "promos" | "events" | "gallery" | "closed-dates" | "hours";

const TABS: { id: Tab; label: string }[] = [
  { id: "promos", label: "Promo" },
  { id: "events", label: "Eventi" },
  { id: "gallery", label: "Galleria" },
  { id: "hours", label: "Orari" },
  { id: "closed-dates", label: "Chiusure" },
];

export function ContentManager() {
  const [tab, setTab] = useState<Tab>("promos");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.6rem] font-bold tracking-[0.24em] text-ember uppercase">Sito</p>
        <h1 className="mt-2 font-display text-3xl">Contenuti</h1>
        <p className="mt-1 text-[0.78rem] text-dim">
          Tutto ciò che il pubblico vede, senza toccare il codice.
        </p>
      </header>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {TABS.map((option) => (
          <button
            key={option.id}
            onClick={() => setTab(option.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[0.66rem] font-bold tracking-[0.1em] uppercase transition-colors",
              tab === option.id
                ? "border-cream bg-cream text-ink"
                : "border-cream/15 text-cream/60 hover:border-cream/35",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {tab === "promos" && <PromosPanel />}
      {tab === "events" && <EventsPanel />}
      {tab === "gallery" && <GalleryPanel />}
      {tab === "hours" && <HoursPanel />}
      {tab === "closed-dates" && <ClosedDatesPanel />}
    </div>
  );
}

function PromosPanel() {
  const [promos, setPromos] = useState<AdminPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<AdminPromo> | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast, notify, clear } = useToast();

  const load = async () => {
    try {
      const data = await api.get<{ promos: AdminPromo[] }>("/api/admin/content?resource=promos");
      setPromos(data.promos);
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        const data = await api.patch<{ promos: AdminPromo }>(
          `/api/admin/content?resource=promos&id=${editing.id}`,
          editing,
        );
        setPromos((current) => current.map((p) => (p.id === editing.id ? data.promos : p)));
      } else {
        const data = await api.post<{ promos: AdminPromo }>("/api/admin/content?resource=promos", editing);
        setPromos((current) => [...current, data.promos]);
      }
      setEditing(null);
      notify("Promo salvata");
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (promo: AdminPromo) => {
    if (!window.confirm(`Eliminare "${promo.title}"?`)) return;
    try {
      await api.delete(`/api/admin/content?resource=promos&id=${promo.id}`);
      setPromos((current) => current.filter((p) => p.id !== promo.id));
      notify("Promo eliminata");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  return (
    <Panel
      title="Promozioni attive"
      action={
        <button
          onClick={() => setEditing({ title: "", description: "", badge: "", dayOfWeek: null, isActive: true, sortOrder: 0 })}
          className="btn btn-flame btn-sm"
        >
          <Plus className="size-3.5" /> Nuova promo
        </button>
      }
    >
      {loading ? (
        <Spinner className="mx-auto my-10 text-ember" />
      ) : promos.length === 0 ? (
        <EmptyState title="Nessuna promo" description="Aggiungi un’offerta e comparirà subito nella home." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {promos.map((promo) => (
            <article key={promo.id} className="rounded-xl border border-cream/10 bg-cream/[0.02] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="chip">{promo.badge || "Sempre"}</span>
                  <h3 className="mt-2 font-display text-lg">{promo.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[0.75rem] text-dim">{promo.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Toggle
                    checked={promo.isActive}
                    onChange={async (value) => {
                      try {
                        await api.patch(`/api/admin/content?resource=promos&id=${promo.id}`, {
                          isActive: value,
                        });
                        setPromos((current) =>
                          current.map((p) => (p.id === promo.id ? { ...p, isActive: value } : p)),
                        );
                      } catch (err) {
                        notify(errorMessage(err), "error");
                      }
                    }}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing(promo)}
                      className="grid size-7 place-items-center rounded border border-cream/15 text-cream/60 hover:text-ember"
                      aria-label="Modifica"
                    >
                      <Pencil className="size-3" />
                    </button>
                    <button
                      onClick={() => void remove(promo)}
                      className="grid size-7 place-items-center rounded border border-cream/15 text-cream/50 hover:text-flame"
                      aria-label="Elimina"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Promo">
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="admin-label">Titolo</label>
              <input
                className="admin-field"
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Descrizione</label>
              <textarea
                rows={3}
                className="admin-field resize-none"
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="admin-label">Badge</label>
                <input
                  className="admin-field"
                  value={editing.badge ?? ""}
                  onChange={(e) => setEditing({ ...editing, badge: e.target.value })}
                  placeholder="Lunedì"
                />
              </div>
              <div>
                <label className="admin-label">Giorno</label>
                <select
                  className="admin-field"
                  value={editing.dayOfWeek ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      dayOfWeek: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                >
                  <option value="" className="bg-ink">Tutti i giorni</option>
                  {["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"].map(
                    (label, index) => (
                      <option key={label} value={index} className="bg-ink">
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="btn btn-ghost btn-sm">
                Annulla
              </button>
              <button onClick={save} disabled={saving} className="btn btn-flame btn-sm">
                Salva
              </button>
            </div>
          </div>
        )}
      </Modal>
      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </Panel>
  );
}

function EventsPanel() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<AdminEvent> | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast, notify, clear } = useToast();
  const { upload, uploading } = useUpload();

  const load = async () => {
    try {
      const data = await api.get<{ events: AdminEvent[] }>("/api/admin/content?resource=events");
      setEvents(data.events);
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        const data = await api.patch<{ events: AdminEvent }>(
          `/api/admin/content?resource=events&id=${editing.id}`,
          editing,
        );
        setEvents((current) => current.map((e) => (e.id === editing.id ? data.events : e)));
      } else {
        const data = await api.post<{ events: AdminEvent }>("/api/admin/content?resource=events", editing);
        setEvents((current) => [...current, data.events]);
      }
      setEditing(null);
      notify("Evento salvato");
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (event: AdminEvent) => {
    if (!window.confirm(`Eliminare "${event.title}"?`)) return;
    try {
      await api.delete(`/api/admin/content?resource=events&id=${event.id}`);
      setEvents((current) => current.filter((e) => e.id !== event.id));
      notify("Evento eliminato");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  return (
    <Panel
      title="Eventi & live"
      action={
        <button
          onClick={() =>
            setEditing({
              title: "",
              subtitle: "",
              description: "",
              imageUrl: "",
              eventDate: null,
              eventTime: "",
              badge: "",
              ctaLabel: "Prenota",
              isPublished: true,
              sortOrder: 0,
            })
          }
          className="btn btn-flame btn-sm"
        >
          <Plus className="size-3.5" /> Nuovo evento
        </button>
      }
    >
      {loading ? (
        <Spinner className="mx-auto my-10 text-ember" />
      ) : events.length === 0 ? (
        <EmptyState title="Nessun evento" description="Crea una serata e pubblicala nella home." />
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-cream/10 bg-cream/[0.02] p-3"
            >
              <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-ink">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center text-dim/40">
                    <ImagePlus className="size-5" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[1.02rem]">{event.title}</p>
                <p className="text-[0.66rem] text-dim">
                  {event.eventDate ? formatDate(event.eventDate) : "Data libera"} · {event.eventTime || "—"}
                </p>
              </div>
              <Toggle
                checked={event.isPublished}
                onChange={async (value) => {
                  try {
                    await api.patch(`/api/admin/content?resource=events&id=${event.id}`, {
                      isPublished: value,
                    });
                    setEvents((current) =>
                      current.map((e) => (e.id === event.id ? { ...e, isPublished: value } : e)),
                    );
                  } catch (err) {
                    notify(errorMessage(err), "error");
                  }
                }}
              />
              <button
                onClick={() => setEditing(event)}
                className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/60 hover:text-ember"
                aria-label="Modifica"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={() => void remove(event)}
                className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/50 hover:text-flame"
                aria-label="Elimina"
              >
                <Trash2 className="size-3.5" />
              </button>
            </article>
          ))}
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Evento" size="lg">
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="admin-label">Titolo</label>
                <input
                  className="admin-field"
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <label className="admin-label">Sottotitolo</label>
                <input
                  className="admin-field"
                  value={editing.subtitle ?? ""}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                />
              </div>
              <div>
                <label className="admin-label">Badge</label>
                <input
                  className="admin-field"
                  value={editing.badge ?? ""}
                  onChange={(e) => setEditing({ ...editing, badge: e.target.value })}
                  placeholder="Ogni sabato"
                />
              </div>
              <div>
                <label className="admin-label">Data</label>
                <input
                  type="date"
                  className="admin-field"
                  value={editing.eventDate ?? ""}
                  onChange={(e) => setEditing({ ...editing, eventDate: e.target.value || null })}
                />
              </div>
              <div>
                <label className="admin-label">Orario</label>
                <input
                  className="admin-field"
                  value={editing.eventTime ?? ""}
                  onChange={(e) => setEditing({ ...editing, eventTime: e.target.value })}
                  placeholder="22:00"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label">Descrizione</label>
                <textarea
                  rows={3}
                  className="admin-field resize-none"
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label">Immagine</label>
                <div className="flex gap-2">
                  <input
                    className="admin-field"
                    value={editing.imageUrl ?? ""}
                    onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-cream/20 px-3 text-[0.62rem] font-bold uppercase hover:border-ember/60">
                    {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await upload(file);
                          setEditing((current) => (current ? { ...current, imageUrl: url } : current));
                        } catch (err) {
                          notify(errorMessage(err), "error");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="btn btn-ghost btn-sm">
                Annulla
              </button>
              <button onClick={save} disabled={saving} className="btn btn-flame btn-sm">
                Salva
              </button>
            </div>
          </div>
        )}
      </Modal>
      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </Panel>
  );
}

function GalleryPanel() {
  const [images, setImages] = useState<AdminGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const { toast, notify, clear } = useToast();
  const { upload, uploading } = useUpload();

  const load = async () => {
    try {
      const data = await api.get<{ gallery: AdminGallery[] }>("/api/admin/content?resource=gallery");
      setImages(data.gallery);
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async (imageUrl: string) => {
    if (!imageUrl) return;
    try {
      const data = await api.post<{ gallery: AdminGallery }>("/api/admin/content?resource=gallery", {
        url: imageUrl,
        sortOrder: images.length,
      });
      setImages((current) => [...current, data.gallery]);
      setUrl("");
      notify("Immagine aggiunta");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  const remove = async (image: AdminGallery) => {
    if (!window.confirm("Rimuovere questa immagine?")) return;
    try {
      await api.delete(`/api/admin/content?resource=gallery&id=${image.id}`);
      setImages((current) => current.filter((i) => i.id !== image.id));
      notify("Immagine rimossa");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  return (
    <Panel title="Galleria">
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="admin-field flex-1"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="URL immagine o carica un file"
        />
        <button onClick={() => void add(url)} className="btn btn-flame btn-sm shrink-0">
          <Plus className="size-3.5" /> Aggiungi
        </button>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-cream/20 px-3 text-[0.62rem] font-bold uppercase hover:border-ember/60">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
          Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                const uploaded = await upload(file);
                await add(uploaded);
              } catch (err) {
                notify(errorMessage(err), "error");
              }
            }}
          />
        </label>
      </div>

      {loading ? (
        <Spinner className="mx-auto my-10 text-ember" />
      ) : images.length === 0 ? (
        <EmptyState title="Galleria vuota" description="Carica le foto del locale e dei piatti." />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-xl border border-cream/10">
              <img src={image.url} alt={image.caption} className="aspect-square w-full object-cover" />
              <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink/90 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-[0.62rem]">{image.caption || "Senza didascalia"}</p>
                <button
                  onClick={() => void remove(image)}
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-flame text-white"
                  aria-label="Rimuovi"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </Panel>
  );
}

function HoursPanel() {
  const [hours, setHours] = useState<
    { dayOfWeek: number; label: string; lunchOpen: string | null; lunchClose: string | null; dinnerOpen: string | null; dinnerClose: string | null; isClosed: boolean }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const { toast, notify, clear } = useToast();

  useEffect(() => {
    api
      .get<{ hours: typeof hours }>("/api/admin/content?resource=hours")
      .then((data) => setHours(data.hours))
      .catch((err) => notify(errorMessage(err), "error"));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const data = await api.post<{ hours: typeof hours }>("/api/admin/content?resource=hours", {
        hours,
      });
      setHours(data.hours);
      notify("Orari aggiornati");
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const update = (index: number, patch: Partial<(typeof hours)[number]>) => {
    setHours((current) => current.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  };

  return (
    <Panel
      title="Orari di apertura"
      action={
        <button onClick={save} disabled={saving} className="btn btn-flame btn-sm">
          <Clock className="size-3.5" /> Salva orari
        </button>
      }
    >
      <div className="space-y-2">
        {hours.map((row, index) => (
          <div
            key={row.dayOfWeek}
            className="grid gap-2 rounded-xl border border-cream/10 bg-cream/[0.02] p-3 sm:grid-cols-[7rem_1fr_1fr_auto] sm:items-center"
          >
            <span className="text-[0.8rem] font-semibold">{row.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-9 text-[0.55rem] tracking-[0.08em] text-dim uppercase">Pranzo</span>
              <input
                type="time"
                className="admin-field"
                value={row.lunchOpen ?? ""}
                onChange={(e) => update(index, { lunchOpen: e.target.value || null })}
                disabled={row.isClosed}
              />
              <input
                type="time"
                className="admin-field"
                value={row.lunchClose ?? ""}
                onChange={(e) => update(index, { lunchClose: e.target.value || null })}
                disabled={row.isClosed}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-9 text-[0.55rem] tracking-[0.08em] text-dim uppercase">Cena</span>
              <input
                type="time"
                className="admin-field"
                value={row.dinnerOpen ?? ""}
                onChange={(e) => update(index, { dinnerOpen: e.target.value || null })}
                disabled={row.isClosed}
              />
              <input
                type="time"
                className="admin-field"
                value={row.dinnerClose ?? ""}
                onChange={(e) => update(index, { dinnerClose: e.target.value || null })}
                disabled={row.isClosed}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.55rem] tracking-[0.08em] text-dim uppercase">Chiuso</span>
              <Toggle
                checked={row.isClosed}
                onChange={(value) => update(index, { isClosed: value })}
                label={`${row.label} chiuso`}
              />
            </div>
          </div>
        ))}
      </div>
      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </Panel>
  );
}

function ClosedDatesPanel() {
  const [dates, setDates] = useState<{ date: string; reason: string }[]>([]);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const { toast, notify, clear } = useToast();

  const load = async () => {
    try {
      const data = await api.get<{ "closed-dates": { date: string; reason: string }[] }>(
        "/api/admin/content?resource=closed-dates",
      );
      setDates(data["closed-dates"]);
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async () => {
    if (!date) return;
    try {
      await api.post("/api/admin/content?resource=closed-dates", { date, reason });
      setDate("");
      setReason("");
      void load();
      notify("Chiusura aggiunta");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  const remove = async (value: string) => {
    try {
      await api.delete(`/api/admin/content?resource=closed-dates&id=${value}`);
      setDates((current) => current.filter((d) => d.date !== value));
      notify("Chiusura rimossa");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  return (
    <Panel title="Giorni di chiusura">
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="date"
          className="admin-field w-auto"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <input
          className="admin-field flex-1"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Motivo (es. festività)"
        />
        <button onClick={add} className="btn btn-flame btn-sm shrink-0">
          <Plus className="size-3.5" /> Aggiungi
        </button>
      </div>

      {dates.length === 0 ? (
        <EmptyState
          title="Nessuna chiusura"
          description="Le date aggiunte qui bloccano le prenotazioni online."
        />
      ) : (
        <ul className="divide-y divide-cream/8">
          {dates.map((entry) => (
            <li key={entry.date} className="flex items-center gap-3 py-2.5">
              <CalendarOff className="size-4 text-flame" />
              <div className="flex-1">
                <p className="text-[0.82rem]">{formatDate(entry.date)}</p>
                <p className="text-[0.66rem] text-dim">{entry.reason || "Chiusura"}</p>
              </div>
              <button
                onClick={() => void remove(entry.date)}
                className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/50 hover:text-flame"
                aria-label="Rimuovi"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </Panel>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[0.7rem] font-bold tracking-[0.16em] uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
