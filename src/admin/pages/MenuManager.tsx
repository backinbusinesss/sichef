import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useContent } from "@/lib/content";
import { errorMessage, useUpload } from "../useAdmin";
import { EmptyState, Modal, Spinner, Toast, Toggle, useToast } from "../ui";
import { cn, euro } from "@/lib/utils";
import type { Allergen, MenuItem } from "@/lib/types";

type FormState = {
  id?: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  sortOrder: number;
  allergens: string[];
};

const emptyForm = (categoryId: string): FormState => ({
  categoryId,
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  isAvailable: true,
  isFeatured: false,
  isVegan: false,
  isVegetarian: false,
  isGlutenFree: false,
  isSpicy: false,
  sortOrder: 0,
  allergens: [],
});

export function MenuManager() {
  const { content, refresh } = useContent();
  const categories = content?.categories ?? [];
  const allergens: Allergen[] = content?.allergens ?? [];
  const [items, setItems] = useState<MenuItem[]>(content?.items ?? []);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(!content);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const { toast, notify, clear } = useToast();
  const { upload, uploading } = useUpload();

  const load = async () => {
    try {
      const data = await api.get<{ items: MenuItem[] }>("/api/menu-items");
      setItems(data.items);
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (activeCategory !== "all" && item.categoryId !== activeCategory) return false;
      if (q && !`${item.name} ${item.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, activeCategory, query]);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  const openCreate = () => {
    const first = activeCategory !== "all" ? activeCategory : categories[0]?.id;
    if (!first) {
      notify("Crea prima una categoria.", "error");
      return;
    }
    setFormError(null);
    setEditing(emptyForm(first));
  };

  const openEdit = (item: MenuItem) => {
    setFormError(null);
    setEditing({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price.toFixed(2),
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      isVegan: item.isVegan,
      isVegetarian: item.isVegetarian,
      isGlutenFree: item.isGlutenFree,
      isSpicy: item.isSpicy,
      sortOrder: item.sortOrder,
      allergens: item.allergens,
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setFormError(null);
    const payload = {
      categoryId: editing.categoryId,
      name: editing.name,
      description: editing.description,
      price: Number(editing.price.replace(",", ".")),
      imageUrl: editing.imageUrl,
      isAvailable: editing.isAvailable,
      isFeatured: editing.isFeatured,
      isVegan: editing.isVegan,
      isVegetarian: editing.isVegetarian,
      isGlutenFree: editing.isGlutenFree,
      isSpicy: editing.isSpicy,
      sortOrder: editing.sortOrder,
      allergens: editing.allergens,
    };
    try {
      if (editing.id) {
        const data = await api.patch<{ item: MenuItem }>(
          `/api/menu-items?id=${editing.id}`,
          payload,
        );
        setItems((current) => current.map((i) => (i.id === editing.id ? data.item : i)));
        notify("Piatto aggiornato");
      } else {
        const data = await api.post<{ item: MenuItem }>("/api/menu-items", payload);
        setItems((current) => [...current, data.item]);
        notify("Piatto aggiunto");
      }
      setEditing(null);
      void refresh();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    setItems((current) =>
      current.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i)),
    );
    try {
      await api.patch(`/api/menu-items?id=${item.id}`, { isAvailable: !item.isAvailable });
      void refresh();
    } catch (err) {
      setItems((current) =>
        current.map((i) => (i.id === item.id ? { ...i, isAvailable: item.isAvailable } : i)),
      );
      notify(errorMessage(err), "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/api/menu-items?id=${deleting.id}`);
      setItems((current) => current.filter((i) => i.id !== deleting.id));
      setDeleting(null);
      notify("Piatto eliminato");
      void refresh();
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  const addCategory = async () => {
    if (newCategory.trim().length < 2) return;
    try {
      const data = await api.post<{ category: { id: string } }>("/api/categories", {
        name: newCategory,
        kind: "food",
      });
      setNewCategory("");
      await refresh();
      setActiveCategory(data.category.id);
      notify("Categoria creata");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  const removeCategory = async (id: string) => {
    if (!window.confirm("Eliminare questa categoria? Deve essere vuota.")) return;
    try {
      await api.delete(`/api/categories?id=${id}`);
      await refresh();
      if (activeCategory === id) setActiveCategory("all");
      notify("Categoria eliminata");
    } catch (err) {
      notify(errorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-bold tracking-[0.24em] text-ember uppercase">Cucina</p>
          <h1 className="mt-2 font-display text-3xl">Menu & allergeni</h1>
          <p className="mt-1 text-[0.78rem] text-dim">
            {items.length} piatti · {items.filter((i) => !i.isAvailable).length} non disponibili oggi
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategoryOpen(true)} className="btn btn-ghost btn-sm">
            Categorie
          </button>
          <button onClick={openCreate} className="btn btn-flame btn-sm">
            <Plus className="size-3.5" /> Nuovo piatto
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-dim" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca un piatto…"
            className="admin-field pl-9"
          />
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[0.64rem] font-bold tracking-[0.08em] uppercase",
              activeCategory === "all"
                ? "border-cream bg-cream text-ink"
                : "border-cream/15 text-cream/60",
            )}
          >
            Tutte
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[0.64rem] font-bold tracking-[0.08em] uppercase",
                activeCategory === category.id
                  ? "border-cream bg-cream text-ink"
                  : "border-cream/15 text-cream/60 hover:border-cream/35",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid h-40 place-items-center">
          <Spinner className="size-5 text-ember" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nessun piatto"
          description="Aggiungi il primo piatto a questa categoria: nome, prezzo e allergeni."
          action={
            <button onClick={openCreate} className="btn btn-flame btn-sm">
              <Plus className="size-3.5" /> Nuovo piatto
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <article
              key={item.id}
              className={cn(
                "group flex flex-wrap items-center gap-3 rounded-2xl border border-cream/10 bg-cream/[0.02] p-3 transition-colors hover:border-cream/25",
                !item.isAvailable && "opacity-60",
              )}
            >
              <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-ink">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
                ) : (
                  <span className="grid size-full place-items-center text-dim/40">
                    <UtensilsCrossed className="size-5" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-display text-[1.05rem]">{item.name}</h3>
                  {item.isFeatured && (
                    <span className="rounded-full bg-ember/15 px-1.5 py-0.5 text-[0.5rem] font-bold tracking-[0.1em] text-ember uppercase">
                      Signature
                    </span>
                  )}
                  {item.isVegan && <span className="text-[0.6rem]">🌱</span>}
                  {item.isGlutenFree && <span className="text-[0.6rem]">🌾̸</span>}
                  {item.isSpicy && <span className="text-[0.6rem]">🌶️</span>}
                </div>
                <p className="mt-0.5 truncate text-[0.7rem] text-dim">
                  {categoryName(item.categoryId)} · {item.allergens.length} allergeni
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {item.allergens.map((code) => {
                    const allergen = allergens.find((a) => a.code === code);
                    if (!allergen) return null;
                    return (
                      <span
                        key={code}
                        className="rounded border border-cream/12 px-1 py-0.5 text-[0.55rem] text-cream/60"
                      >
                        {allergen.emoji} {allergen.shortName}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="font-display text-lg tabular-nums">{euro(item.price)}</span>
                <div className="flex items-center gap-1.5 rounded-xl border border-cream/10 px-2.5 py-1.5">
                  <span className="text-[0.55rem] font-bold tracking-[0.08em] text-dim uppercase">
                    {item.isAvailable ? "On" : "Off"}
                  </span>
                  <Toggle
                    checked={item.isAvailable}
                    onChange={() => void toggleAvailability(item)}
                    label={`Disponibilità ${item.name}`}
                  />
                </div>
                <button
                  onClick={() => openEdit(item)}
                  className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/60 hover:border-ember/50 hover:text-ember"
                  aria-label={`Modifica ${item.name}`}
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(item)}
                  className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/50 hover:border-flame/50 hover:text-flame"
                  aria-label={`Elimina ${item.name}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* edit modal */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Modifica piatto" : "Nuovo piatto"}
        size="lg"
      >
        {editing && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="admin-label">Nome *</label>
                <input
                  className="admin-field"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Bacon Cheese"
                />
              </div>
              <div>
                <label className="admin-label">Categoria *</label>
                <select
                  className="admin-field"
                  value={editing.categoryId}
                  onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-ink">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-label">Prezzo (€) *</label>
                <input
                  className="admin-field"
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                  inputMode="decimal"
                  placeholder="13.50"
                />
              </div>
              <div>
                <label className="admin-label">Ordine</label>
                <input
                  type="number"
                  className="admin-field"
                  value={editing.sortOrder}
                  onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label">Descrizione</label>
                <textarea
                  rows={3}
                  className="admin-field resize-none"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Ingredienti, cottura, salsa…"
                />
              </div>
            </div>

            {/* image */}
            <div>
              <label className="admin-label">Immagine</label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="size-24 overflow-hidden rounded-xl border border-cream/10 bg-ink">
                  {editing.imageUrl ? (
                    <img src={editing.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center text-dim/40">
                      <ImagePlus className="size-6" />
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    className="admin-field"
                    value={editing.imageUrl}
                    onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                    placeholder="/assets/img/dish-pizza.webp oppure https://…"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cream/20 px-3 py-2 text-[0.66rem] font-bold tracking-[0.1em] uppercase hover:border-ember/60">
                    {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
                    {uploading ? "Carico…" : "Carica file"}
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
                          notify("Immagine caricata");
                        } catch (err) {
                          notify(errorMessage(err), "error");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* flags */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ["isAvailable", "Disponibile"],
                  ["isFeatured", "Signature"],
                  ["isVegetarian", "Vegetariano"],
                  ["isVegan", "Vegano"],
                  ["isGlutenFree", "Senza glutine"],
                  ["isSpicy", "Piccante"],
                ] as const
              ).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-cream/10 bg-cream/[0.02] px-3 py-2"
                >
                  <span className="text-[0.72rem] text-cream/75">{label}</span>
                  <Toggle
                    checked={editing[key]}
                    onChange={(value) => setEditing({ ...editing, [key]: value })}
                    label={label}
                  />
                </div>
              ))}
            </div>

            {/* allergens */}
            <div className="rounded-2xl border border-cream/12 bg-ink/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[0.68rem] font-bold tracking-[0.16em] uppercase">
                    Allergeni (14 UE)
                  </h3>
                  <p className="mt-0.5 text-[0.66rem] text-dim">
                    Seleziona quelli presenti nel piatto. Saranno visibili sul sito.
                  </p>
                </div>
                <span className="rounded-full bg-cream/10 px-2 py-0.5 text-[0.6rem] tabular-nums">
                  {editing.allergens.length}
                </span>
              </div>

              <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {allergens.map((allergen) => {
                  const checked = editing.allergens.includes(allergen.code);
                  return (
                    <button
                      key={allergen.code}
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          allergens: checked
                            ? editing.allergens.filter((c) => c !== allergen.code)
                            : [...editing.allergens, allergen.code],
                        })
                      }
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[0.7rem] transition-colors",
                        checked
                          ? "border-ember/60 bg-ember/12 text-cream"
                          : "border-cream/10 text-cream/65 hover:border-cream/30",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded border",
                          checked ? "border-ember bg-ember text-ink" : "border-cream/25",
                        )}
                      >
                        {checked && <Check className="size-2.5" />}
                      </span>
                      <span aria-hidden="true">{allergen.emoji}</span>
                      <span className="truncate">{allergen.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {formError && (
              <div className="rounded-xl border border-flame/40 bg-flame/10 px-3.5 py-2.5 text-[0.78rem] text-flame">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-cream/10 pt-4">
              <button onClick={() => setEditing(null)} className="btn btn-ghost btn-sm">
                Annulla
              </button>
              <button onClick={save} disabled={saving} className="btn btn-flame btn-sm">
                {saving ? <Spinner /> : <Check className="size-3.5" />}
                Salva
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* delete confirm */}
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Eliminare il piatto?" size="sm">
        <p className="text-[0.85rem] text-dim">
          Stai per eliminare <strong className="text-cream">{deleting?.name}</strong>. L’operazione
          non può essere annullata.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setDeleting(null)} className="btn btn-ghost btn-sm">
            Annulla
          </button>
          <button onClick={confirmDelete} className="btn btn-sm bg-flame text-white">
            <Trash2 className="size-3.5" /> Elimina
          </button>
        </div>
      </Modal>

      {/* categories */}
      <Modal open={categoryOpen} onClose={() => setCategoryOpen(false)} title="Categorie">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              className="admin-field"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="Nome nuova categoria"
              onKeyDown={(event) => {
                if (event.key === "Enter") void addCategory();
              }}
            />
            <button onClick={addCategory} className="btn btn-flame btn-sm shrink-0">
              <Plus className="size-3.5" /> Aggiungi
            </button>
          </div>

          <ul className="divide-y divide-cream/8">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-3 py-2.5">
                <span className="text-lg">{category.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.85rem]">{category.name}</p>
                  <p className="text-[0.62rem] text-dim">
                    {items.filter((i) => i.categoryId === category.id).length} piatti ·{" "}
                    {category.kind === "drink" ? "bevande" : "cibo"}
                  </p>
                </div>
                <button
                  onClick={() => void removeCategory(category.id)}
                  className="grid size-8 place-items-center rounded-lg border border-cream/15 text-cream/50 hover:border-flame/50 hover:text-flame"
                  aria-label={`Elimina ${category.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} tone={toast.tone} onDone={clear} />}
    </div>
  );
}
