import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useContent } from "@/lib/content";
import { cn, euro } from "@/lib/utils";
import { DietTags } from "@/components/AllergenBadges";
import { PageHero } from "@/components/PageHero";
import type { Order } from "@/lib/types";

type CartLine = { id: string; quantity: number };
type Mode = "pickup" | "delivery";

const CART_KEY = "sichef_cart_v1";

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((line) => typeof line.id === "string" && line.quantity > 0) : [];
  } catch {
    return [];
  }
}

function timeOptions() {
  const options: string[] = [];
  for (let minutes = 12 * 60; minutes <= 21 * 60 + 30; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    options.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }
  return options;
}

export function OrderPage() {
  const { content } = useContent();
  const [cart, setCart] = useState<CartLine[]>(() => loadCart());
  const [mode, setMode] = useState<Mode>("pickup");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [pickupTime, setPickupTime] = useState("asap");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<Order | null>(null);

  const items = content?.items ?? [];
  const categories = content?.categories ?? [];
  const orderSettings = content?.settings.order;
  const venue = content?.settings.venue;
  const deliveryFee = orderSettings?.deliveryFee ?? Number(venue?.deliveryFee ?? 3);
  const deliveryMinimum = orderSettings?.deliveryMinimum ?? Number(venue?.deliveryMinimum ?? 20);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  useEffect(() => {
    if (!cartOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [cartOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!item.isAvailable) return false;
      if (activeCategory !== "all" && item.categoryId !== activeCategory) return false;
      if (q && !`${item.name} ${item.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, activeCategory, query]);

  const grouped = useMemo(
    () =>
      categories
        .map((category) => ({ category, menu: filtered.filter((item) => item.categoryId === category.id) }))
        .filter((group) => group.menu.length > 0),
    [categories, filtered],
  );

  const lines = useMemo(
    () =>
      cart
        .map((line) => {
          const item = items.find((menuItem) => menuItem.id === line.id);
          return item ? { ...line, item, lineTotal: item.price * line.quantity } : null;
        })
        .filter(Boolean) as { id: string; quantity: number; item: (typeof items)[number]; lineTotal: number }[],
    [cart, items],
  );

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const fee = mode === "delivery" && lines.length > 0 ? deliveryFee : 0;
  const total = subtotal + fee;
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const belowMinimum = mode === "delivery" && subtotal > 0 && subtotal < deliveryMinimum;

  const add = (id: string) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === id);
      if (existing) return current.map((line) => (line.id === id ? { ...line, quantity: line.quantity + 1 } : line));
      return [...current, { id, quantity: 1 }];
    });
  };

  const remove = (id: string) => {
    setCart((current) =>
      current
        .map((line) => (line.id === id ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0),
    );
  };

  const removeLine = (id: string) => setCart((current) => current.filter((line) => line.id !== id));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const result = await api.post<{ order: Order }>("/api/orders", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        fulfilment: mode,
        address: mode === "delivery" ? form.address : "",
        pickupTime: pickupTime === "asap" ? "Prima possibile" : pickupTime,
        notes: form.notes,
        items: lines.map((line) => ({ id: line.id, quantity: line.quantity })),
      });
      setOrder(result.order);
      setCart([]);
      setCartOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setFieldErrors(err.fields);
        setError(err.message);
      } else {
        setError("Non è stato possibile inviare l'ordine. Riprova o chiamaci.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <>
        <PageHero
          eyebrow="Ordine ricevuto"
          title="Grazie,"
          italic="ci pensiamo noi."
          description="Abbiamo ricevuto il tuo ordine. Ti chiamiamo per conferma e ti avvisiamo quando è pronto."
          image="/assets/img/dish-pizza.webp"
          crumb="Ordine confermato"
        />
        <section className="bg-cream py-16 md:py-24">
          <div className="shell max-w-3xl">
            <div className="rounded-[2rem] border border-ink/10 bg-paper p-7 text-center shadow-[0_30px_80px_-60px_rgba(20,37,30,.5)] md:p-10">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-ink text-cream">
                <CheckCircle2 className="size-8" />
              </span>
              <h2 className="mt-6 text-4xl">Ordine confermato.</h2>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-ink/55">
                Il tuo codice ordine è <strong className="font-mono text-ink">{order.code}</strong>.
                Conservalo per qualsiasi comunicazione.
              </p>
              <div className="mt-7 grid gap-3 rounded-2xl border border-ink/10 bg-cream p-5 text-left sm:grid-cols-3">
                <div>
                  <p className="text-[0.54rem] font-extrabold tracking-[0.15em] text-ink/35 uppercase">Ritiro / consegna</p>
                  <p className="mt-1 text-[0.82rem] font-semibold">{order.fulfilment === "pickup" ? "Ritiro in sede" : "Consegna a domicilio"}</p>
                </div>
                <div>
                  <p className="text-[0.54rem] font-extrabold tracking-[0.15em] text-ink/35 uppercase">Orario</p>
                  <p className="mt-1 text-[0.82rem] font-semibold">{order.pickupTime}</p>
                </div>
                <div>
                  <p className="text-[0.54rem] font-extrabold tracking-[0.15em] text-ink/35 uppercase">Totale</p>
                  <p className="mt-1 text-[0.82rem] font-semibold text-flame">{euro(order.total)}</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-ink/10 bg-white/40 p-4 text-left">
                {order.items?.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-center justify-between border-b border-ink/8 py-2 text-[0.8rem] last:border-0">
                    <span>{item.quantity} × {item.name}</span>
                    <span className="font-semibold tabular-nums">{euro(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                <Link to="/" className="btn btn-ghost flex-1">Torna alla home</Link>
                <a href={`tel:${(venue?.phone ?? "").replace(/\s/g, "")}`} className="btn btn-clay flex-1">
                  <Phone className="size-4" />
                  Chiamaci
                </a>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  const cartPanel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ink/10 pb-4">
        <div>
          <p className="text-[0.56rem] font-extrabold tracking-[0.2em] text-ink/35 uppercase">Il tuo ordine</p>
          <h2 className="mt-1 text-2xl">{count} {count === 1 ? "articolo" : "articoli"}</h2>
        </div>
        <button
          onClick={() => setCartOpen(false)}
          className="grid size-9 place-items-center rounded-full border border-ink/12 text-ink/60 lg:hidden"
          aria-label="Chiudi carrello"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-ink/5 p-1">
        <button
          onClick={() => setMode("pickup")}
          className={cn("flex items-center justify-center gap-1.5 rounded-lg py-2 text-[0.62rem] font-extrabold tracking-[0.08em] uppercase transition-colors", mode === "pickup" ? "bg-paper text-ink shadow-sm" : "text-ink/45")}
        >
          <Store className="size-3.5" /> Ritiro
        </button>
        <button
          onClick={() => setMode("delivery")}
          className={cn("flex items-center justify-center gap-1.5 rounded-lg py-2 text-[0.62rem] font-extrabold tracking-[0.08em] uppercase transition-colors", mode === "delivery" ? "bg-paper text-ink shadow-sm" : "text-ink/45")}
        >
          <Bike className="size-3.5" /> Consegna
        </button>
      </div>
      <p className="mt-2 text-[0.65rem] leading-relaxed text-ink/40">
        {mode === "pickup"
          ? "Ritiro in Via S. Clemente 151, Cerro Maggiore."
          : `Consegna a Cerro Maggiore e zone limitrofe. Minimo ${euro(deliveryMinimum)}, costo ${euro(deliveryFee)}.`}
      </p>

      <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
        {lines.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/15 p-6 text-center">
            <ShoppingBag className="mx-auto size-6 text-ink/25" />
            <p className="mt-2 text-[0.78rem] text-ink/40">Il carrello è vuoto.</p>
            <p className="mt-1 text-[0.65rem] text-ink/30">Aggiungi qualcosa di buono dal menu.</p>
          </div>
        ) : (
          lines.map((line) => (
            <div key={line.id} className="flex items-start gap-3 rounded-xl bg-white/45 p-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.78rem] font-semibold">{line.item.name}</p>
                <p className="mt-0.5 text-[0.62rem] text-ink/40">{euro(line.item.price)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => remove(line.id)} className="grid size-6 place-items-center rounded-full border border-ink/15 text-ink/60" aria-label={`Riduci ${line.item.name}`}>
                  <Minus className="size-3" />
                </button>
                <span className="w-4 text-center text-[0.72rem] font-bold tabular-nums">{line.quantity}</span>
                <button onClick={() => add(line.id)} className="grid size-6 place-items-center rounded-full border border-ink/15 text-ink/60" aria-label={`Aumenta ${line.item.name}`}>
                  <Plus className="size-3" />
                </button>
                <button onClick={() => removeLine(line.id)} className="ml-1 text-ink/25 hover:text-flame" aria-label={`Rimuovi ${line.item.name}`}>
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {lines.length > 0 && (
        <form onSubmit={submit} className="mt-4 space-y-3 border-t border-ink/10 pt-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[0.72rem] text-ink/50"><span>Subtotale</span><span className="tabular-nums">{euro(subtotal)}</span></div>
            {mode === "delivery" && <div className="flex justify-between text-[0.72rem] text-ink/50"><span>Consegna</span><span className="tabular-nums">{euro(fee)}</span></div>}
            <div className="flex items-end justify-between border-t border-ink/10 pt-2"><span className="text-[0.62rem] font-extrabold tracking-[0.12em] text-ink/45 uppercase">Totale</span><span className="font-display text-2xl text-flame">{euro(total)}</span></div>
          </div>

          <div>
            <label className="field-label" htmlFor="order-time">Orario</label>
            <select id="order-time" className="field bg-white/60" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)}>
              <option value="asap">Prima possibile</option>
              {timeOptions().map((time) => <option key={time} value={time}>{time}</option>)}
            </select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <label className="field-label" htmlFor="order-name">Nome *</label>
              <input id="order-name" className="field bg-white/60" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" required />
              {fieldErrors.name && <p className="mt-1 text-[0.66rem] text-flame">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="field-label" htmlFor="order-phone">Telefono *</label>
              <input id="order-phone" className="field bg-white/60" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} autoComplete="tel" inputMode="tel" required />
              {fieldErrors.phone && <p className="mt-1 text-[0.66rem] text-flame">{fieldErrors.phone}</p>}
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="order-email">Email</label>
            <input id="order-email" type="email" className="field bg-white/60" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" />
          </div>
          {mode === "delivery" && (
            <div>
              <label className="field-label" htmlFor="order-address">Indirizzo di consegna *</label>
              <input id="order-address" className="field bg-white/60" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} autoComplete="street-address" required />
              {fieldErrors.address && <p className="mt-1 text-[0.66rem] text-flame">{fieldErrors.address}</p>}
            </div>
          )}
          <div>
            <label className="field-label" htmlFor="order-notes">Note</label>
            <textarea id="order-notes" rows={2} className="field resize-none bg-white/60" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Allergie, citofono, richieste…" />
          </div>

          {belowMinimum && <p className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-[0.68rem] leading-relaxed text-ink/65">Per la consegna il minimo è {euro(deliveryMinimum)}: aggiungi ancora {euro(deliveryMinimum - subtotal)}.</p>}
          {error && <p className="rounded-lg border border-flame/30 bg-flame/8 px-3 py-2 text-[0.7rem] text-flame">{error}</p>}

          <label className="flex items-start gap-2 text-[0.62rem] leading-relaxed text-ink/45">
            <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} className="mt-0.5 accent-flame" required />
            Accetto i termini e l'informativa privacy. Il pagamento avviene alla consegna o al ritiro.
          </label>

          <button type="submit" disabled={submitting || belowMinimum || !terms} className="btn btn-clay w-full">
            {submitting ? <><Loader2 className="size-4 animate-spin" /> Invio…</> : <>Invia ordine <ArrowRight className="size-4" /></>}
          </button>
          <p className="text-center text-[0.58rem] text-ink/35">Ti chiamiamo per confermare. Nessun pagamento online.</p>
        </form>
      )}
    </div>
  );

  return (
    <>
      <PageHero
        eyebrow="Asporto & domicilio"
        title="Ordina online,"
        italic="senza fila."
        description="Scegli i piatti, indica se preferisci il ritiro o la consegna e invia l'ordine. Ti confermiamo noi al telefono."
        image="/assets/img/dish-pizza.webp"
        crumb="Ordina online"
      >
        <div className="flex flex-wrap gap-4 text-[0.62rem] font-bold tracking-[0.1em] text-cream/55 uppercase">
          <span className="inline-flex items-center gap-1.5"><Store className="size-3.5 text-ember" /> Ritiro in sede</span>
          <span className="inline-flex items-center gap-1.5"><Bike className="size-3.5 text-ember" /> Consegna {euro(deliveryFee)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-ember" /> Pronto in ~25 min</span>
        </div>
      </PageHero>

      <section className="bg-cream py-12 md:py-16">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
            <div className="min-w-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink/35" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca nel menu…" className="field bg-white/50 pl-11" aria-label="Cerca nel menu da ordinare" />
                </div>
                <div className="relative sm:w-52">
                  <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} className="field appearance-none bg-white/50 pr-9" aria-label="Categoria">
                    <option value="all">Tutte le categorie</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink/35" />
                </div>
              </div>

              <div className="mt-8 space-y-10">
                {grouped.map(({ category, menu }) => (
                  <div key={category.id}>
                    <div className="flex items-end justify-between border-b border-ink/15 pb-3">
                      <div>
                        <h2 className="text-2xl">{category.emoji} {category.name}</h2>
                        <p className="mt-0.5 text-[0.65rem] font-bold tracking-[0.1em] text-flame uppercase">{category.tagline}</p>
                      </div>
                      <span className="text-[0.58rem] font-bold tracking-[0.12em] text-ink/30 uppercase">{menu.length} piatti</span>
                    </div>
                    <div className="divide-y divide-ink/8">
                      {menu.map((item) => {
                        const inCart = cart.find((line) => line.id === item.id);
                        return (
                          <div key={item.id} className="flex items-start gap-4 py-4">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} loading="lazy" className="hidden size-16 shrink-0 rounded-xl object-cover sm:block" />
                            ) : (
                              <div className="hidden size-16 shrink-0 place-items-center rounded-xl bg-cream-2 text-xl sm:grid">{category.emoji}</div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="text-[1.02rem] font-semibold leading-tight">{item.name}</h3>
                                <span className="shrink-0 font-display text-lg font-semibold text-flame">{euro(item.price)}</span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-[0.74rem] leading-relaxed text-ink/45">{item.description}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <DietTags item={item} />
                                {inCart && <span className="text-[0.58rem] font-bold tracking-[0.08em] text-flame uppercase">Nel carrello: {inCart.quantity}</span>}
                              </div>
                            </div>
                            <div className="shrink-0">
                              {inCart ? (
                                <div className="flex items-center gap-1.5 rounded-full border border-ink/12 bg-white/50 p-1">
                                  <button onClick={() => remove(item.id)} className="grid size-6 place-items-center rounded-full hover:bg-ink/5" aria-label={`Riduci ${item.name}`}><Minus className="size-3" /></button>
                                  <span className="w-4 text-center text-[0.72rem] font-bold">{inCart.quantity}</span>
                                  <button onClick={() => add(item.id)} className="grid size-6 place-items-center rounded-full bg-flame text-white" aria-label={`Aggiungi ${item.name}`}><Plus className="size-3" /></button>
                                </div>
                              ) : (
                                <button onClick={() => add(item.id)} className="btn btn-ghost btn-sm">
                                  <Plus className="size-3.5" /> Aggiungi
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {grouped.length === 0 && <p className="py-12 text-center text-[0.85rem] text-ink/45">Nessun piatto trovato. Prova con un'altra ricerca.</p>}
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-[1.4rem] border border-ink/10 bg-paper p-5 shadow-[0_24px_70px_-55px_rgba(20,37,30,.55)]">
                {cartPanel}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 p-3 backdrop-blur-xl lg:hidden">
          <button onClick={() => setCartOpen(true)} className="btn btn-clay w-full justify-between px-5">
            <span className="inline-flex items-center gap-2"><ShoppingBag className="size-4" /> {count} {count === 1 ? "articolo" : "articoli"}</span>
            <span className="inline-flex items-center gap-2">{euro(total)} <ArrowRight className="size-4" /></span>
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[80] flex items-end bg-ink/60 backdrop-blur-sm lg:hidden" onClick={() => setCartOpen(false)}>
          <div className="max-h-[92svh] w-full overflow-y-auto rounded-t-[1.6rem] bg-paper p-5" onClick={(event) => event.stopPropagation()}>
            {cartPanel}
          </div>
        </div>
      )}
    </>
  );
}
