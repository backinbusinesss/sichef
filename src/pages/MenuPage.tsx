import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Filter,
  Grid,
  List,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { AllergenBadges, AllergenLegend, DietTags } from "@/components/AllergenBadges";
import { useContent } from "@/lib/content";
import { cn, euro, scrollToId } from "@/lib/utils";

type ViewMode = "grid" | "list";

export function MenuPage() {
  const { content } = useContent();
  const [query, setQuery] = useState("");
  const [excluded, setExcluded] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");

  const categories = content?.categories ?? [];
  const items = content?.items ?? [];
  const allergens = content?.allergens ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((item) => {
        if (!item.isAvailable) return false;
        if (excluded.length > 0 && item.allergens.some((code) => excluded.includes(code))) return false;
        if (featuredOnly && !item.isFeatured) return false;
        if (q && !`${item.name} ${item.description}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return a.name.localeCompare(b.name, "it");
      });
  }, [items, excluded, query, featuredOnly, sortBy]);

  const grouped = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          items: filtered.filter((item) => item.categoryId === category.id),
        }))
        .filter((group) => group.items.length > 0),
    [categories, filtered],
  );

  if (!content) return null;

  const handleCategoryClick = (slug: string) => {
    setFiltersOpen(false);
    setTimeout(() => scrollToId(`cat-${slug}`), 50);
  };

  const toggleExpand = (id: string) => {
    setExpandedItem((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <PageHero
        eyebrow="Cucina & pizzeria"
        title="Il nostro menu"
        italic="di stagione."
        description="Piatti della tradizione italiana, pesce fresco, carne selezionata e pizza artigianale. Ogni preparazione indica gli allergeni previsti dal Regolamento UE 1169/2011."
        image="/assets/img/pasta.webp"
        crumb="Menu"
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/ordina" className="btn btn-gold">
            Ordina online
            <ArrowRight className="size-3.5" />
          </Link>
          <Link to="/prenota" className="btn btn-ghost-light">
            <CalendarCheck className="size-4" />
            Prenota un tavolo
          </Link>
        </div>
      </PageHero>

      {/* Sticky category navigation */}
      <div className="sticky top-[4.6rem] z-30 border-b border-ink/10 bg-cream/95 backdrop-blur-xl">
        <div className="shell flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className="shrink-0 rounded-full border border-ink/12 bg-white/40 px-3.5 py-1.5 text-[0.58rem] font-extrabold tracking-[0.1em] text-ink/60 uppercase transition-colors hover:border-flame/50 hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2"
            >
              {category.emoji} {category.name}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-cream py-8 md:py-12">
        <div className="shell">
          {/* Search & filters bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cerca un piatto o un ingrediente…"
                className="field bg-white/50 pl-11"
                aria-label="Cerca nel menu"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-ink/35 hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
                  aria-label="Cancella ricerca"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFiltersOpen((value) => !value)}
                className={cn(
                  "btn btn-ghost btn-sm shrink-0",
                  (filtersOpen || excluded.length > 0) && "border-flame/50 text-flame",
                )}
              >
                <Filter className="size-3.5" />
                Escludi allergeni
                {excluded.length > 0 && (
                  <span className="grid size-4 place-items-center rounded-full bg-flame text-[0.52rem] text-white">
                    {excluded.length}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setFeaturedOnly((v) => !v)}
                  className={cn(
                    "btn btn-ghost btn-sm shrink-0 flex items-center gap-1.5",
                    featuredOnly && "border-ember/50 text-ember bg-ember/5",
                  )}
                >
                  <Sparkles className="size-3.5" />
                  Solo in evidenza
                </button>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="field appearance-none bg-white/50 pr-9 text-[0.62rem] font-bold"
                  aria-label="Ordina per"
                >
                  <option value="name">Nome A–Z</option>
                  <option value="price-asc">Prezzo ↑</option>
                  <option value="price-desc">Prezzo ↓</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink/35" />
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "grid size-9 place-items-center rounded-lg border transition-colors",
                    viewMode === "grid" ? "bg-ink text-cream border-ink" : "border-ink/15 text-ink/50 hover:border-ink/30",
                  )}
                  aria-label="Vista a griglia"
                  aria-pressed={viewMode === "grid"}
                >
                  <Grid className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "grid size-9 place-items-center rounded-lg border transition-colors",
                    viewMode === "list" ? "bg-ink text-cream border-ink" : "border-ink/15 text-ink/50 hover:border-ink/30",
                  )}
                  aria-label="Vista a lista"
                  aria-pressed={viewMode === "list"}
                >
                  <List className="size-4" />
                </button>
              </div>

              <span className="text-[0.62rem] font-bold tracking-[0.12em] text-ink/35 uppercase">
                {filtered.length} {filtered.length === 1 ? "piatto" : "piatti"}
              </span>
            </div>
          </div>

          {/* Allergen filters panel */}
          {filtersOpen && (
            <div className="mt-4 rounded-2xl border border-ink/10 bg-paper p-5 animate-slide-down" role="region" aria-label="Filtri allergeni">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[0.76rem] leading-relaxed text-ink/55">
                  Seleziona gli allergeni da <strong className="text-ink">escludere</strong>: i piatti
                  che li contengono verranno nascosti. Per allergie gravi parlane sempre con il
                  personale prima di ordinare.
                </p>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="text-ink/40 hover:text-flame"
                  aria-label="Chiudi filtri"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergens.map((allergen) => {
                  const active = excluded.includes(allergen.code);
                  return (
                    <button
                      key={allergen.code}
                      onClick={() =>
                        setExcluded((current) =>
                          current.includes(allergen.code)
                            ? current.filter((code) => code !== allergen.code)
                            : [...current, allergen.code],
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.66rem] font-bold transition-colors",
                        active
                          ? "border-flame bg-flame/10 text-flame"
                          : "border-ink/12 bg-white/40 text-ink/60 hover:border-ink/30",
                      )}
                      aria-pressed={active}
                    >
                      {allergen.emoji} {allergen.shortName}
                      {active && <X className="size-3" />}
                    </button>
                  );
                })}
              </div>
              {excluded.length > 0 && (
                <button
                  onClick={() => setExcluded([])}
                  className="mt-4 text-[0.62rem] font-extrabold tracking-[0.12em] text-flame uppercase"
                >
                  Azzera filtri
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-cream pb-20">
        <div className="shell">
          <div className="space-y-14">
            {grouped.map(({ category, items: groupItems }) => (
              <div key={category.id} id={`cat-${category.slug}`} className="scroll-mt-32">
                <Reveal className="border-b border-ink/15 pb-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <span className="text-xl" aria-hidden="true">
                        {category.emoji}
                      </span>
                      <h2 className="mt-2 text-[clamp(1.7rem,3.5vw,2.8rem)]">{category.name}</h2>
                      <p className="mt-1 text-[0.72rem] font-bold tracking-[0.12em] text-flame uppercase">
                        {category.tagline}
                      </p>
                    </div>
                    <p className="max-w-lg text-[0.78rem] leading-relaxed text-ink/45">
                      {category.description}
                    </p>
                  </div>
                </Reveal>

                {viewMode === "grid" ? (
                  <div className="mt-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {groupItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        allergens={allergens}
                        expanded={expandedItem === item.id}
                        onToggleExpand={toggleExpand}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 divide-y divide-ink/8">
                    {groupItems.map((item) => (
                      <MenuItemList
                        key={item.id}
                        item={item}
                        allergens={allergens}
                        expanded={expandedItem === item.id}
                        onToggleExpand={toggleExpand}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {grouped.length === 0 && (
              <div className="rounded-3xl border border-ink/10 bg-paper py-16 text-center">
                <p className="font-display text-2xl">Nessun piatto trovato</p>
                <p className="mt-2 text-sm text-ink/45">Prova a rimuovere qualche filtro o modifica la ricerca.</p>
                <button
                  onClick={() => {
                    setExcluded([]);
                    setQuery("");
                    setFeaturedOnly(false);
                  }}
                  className="btn btn-ghost btn-sm mt-5"
                >
                  Azzera tutto
                </button>
              </div>
            )}
          </div>

          {/* Allergen legend */}
          <Reveal className="mt-16 rounded-[1.6rem] border border-ink/10 bg-paper p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="eyebrow">Allergeni</span>
                <h2 className="mt-3 text-2xl">Legenda dei 14 allergeni</h2>
                <p className="mt-2 max-w-xl text-[0.78rem] leading-relaxed text-ink/45">
                  Le preparazioni avvengono in una cucina condivisa: non possiamo escludere
                  contaminazioni crociate. Segnala sempre allergie e intolleranze al personale.
                </p>
              </div>
              <Link to="/contatti" className="btn btn-ghost btn-sm">
                Parlaci delle tue esigenze
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-6 border-t border-ink/10 pt-6">
              <AllergenLegend allergens={allergens} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* Card view component */
function MenuItemCard({
  item,
  allergens,
  expanded,
  onToggleExpand,
}: {
  item: any;
  allergens: any[];
  expanded: boolean;
  onToggleExpand: (id: string) => void;
}) {
  return (
    <article className="group relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-2">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="size-full grid place-items-center text-3xl bg-cream-2">
            {item.categoryEmoji || "🍽️"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(197,154,82,.15),transparent_60%)]" />
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
            <span className="text-[0.6rem] font-bold tracking-[0.12em] text-cream/80 uppercase px-3 py-1 rounded-full bg-ink/80">
              Non disponibile
            </span>
          </div>
        )}
        {item.isFeatured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-ember/90 px-2.5 py-1 text-[0.55rem] font-extrabold tracking-[0.08em] text-ink uppercase">
            <Sparkles className="size-3" /> In evidenza
          </span>
        )}
        <button
          onClick={() => onToggleExpand(item.id)}
          className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full border border-cream/30 bg-ink/40 text-cream backdrop-blur-sm transition-all hover:bg-ink/60 hover:border-cream/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          aria-label={expanded ? `Chiudi dettagli ${item.name}` : `Espandi dettagli ${item.name}`}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[1.1rem] leading-tight font-semibold text-ink/90">
            {item.name}
            {!item.isAvailable && (
              <span className="ml-2 align-middle text-[0.5rem] font-bold tracking-[0.12em] text-ink/35 uppercase">
                (non disponibile)
              </span>
            )}
          </h3>
          <span className="shrink-0 font-display text-lg font-semibold text-flame tabular-nums">
            {euro(item.price)}
          </span>
        </div>

        <p className="max-w-xl text-[0.78rem] leading-relaxed text-ink/50 line-clamp-2">
          {item.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <DietTags item={item} />
          <AllergenBadges codes={item.allergens} allergens={allergens} />
        </div>

        {expanded && (
          <div className="mt-3 rounded-xl border border-ink/10 bg-white/40 p-4 animate-fade-in">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[0.58rem] font-extrabold tracking-[0.1em] text-ink/35 uppercase">Categoria</p>
                <p className="mt-1 text-[0.82rem] font-medium">{item.categoryName || "—"}</p>
              </div>
              <div>
                <p className="text-[0.58rem] font-extrabold tracking-[0.1em] text-ink/35 uppercase">Allergeni</p>
                <p className="mt-1 text-[0.82rem] font-medium">
                  {item.allergens.length > 0
                    ? item.allergens
                        .map((code: string) => {
                          const a = allergens.find((al) => al.code === code);
                          return a ? a.shortName : code;
                        })
                        .join(", ")
                    : "Nessuno"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[0.58rem] font-extrabold tracking-[0.1em] text-ink/35 uppercase">Descrizione completa</p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-ink/60">{item.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

/* List view component */
function MenuItemList({
  item,
  allergens,
  expanded,
  onToggleExpand,
}: {
  item: any;
  allergens: any[];
  expanded: boolean;
  onToggleExpand: (id: string) => void;
}) {
  return (
    <article className="menu-item-row group py-4" style={{ transition: "background 0.3s ease" }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-xl bg-cream-2 transition-transform duration-500",
              expanded ? "size-24" : "size-16",
            )}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500"
              />
            ) : (
              <div className="size-full grid place-items-center text-2xl bg-cream-2">
                {item.categoryEmoji || "🍽️"}
              </div>
            )}
            {!item.isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/60">
                <span className="text-[0.5rem] font-bold tracking-[0.12em] text-cream/80 uppercase px-2 py-0.5 rounded-full bg-ink/80">
                  Non disp.
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[1.05rem] leading-tight font-semibold text-ink/90">
                {item.name}
                {!item.isAvailable && (
                  <span className="ml-2 align-middle text-[0.5rem] font-bold tracking-[0.12em] text-ink/35 uppercase">
                    (non disponibile)
                  </span>
                )}
                {item.isFeatured && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-ember/90 px-2 py-0.5 text-[0.5rem] font-extrabold tracking-[0.08em] text-ink uppercase">
                    <Sparkles className="size-2.5" /> In evidenza
                  </span>
                )}
              </h3>
              <span className="shrink-0 font-display text-lg font-semibold text-flame tabular-nums whitespace-nowrap">
                {euro(item.price)}
              </span>
            </div>

            <p className="mt-1 max-w-xl text-[0.78rem] leading-relaxed text-ink/50 line-clamp-2">
              {item.description}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DietTags item={item} />
              <AllergenBadges codes={item.allergens} allergens={allergens} />
            </div>
          </div>

          <button
            onClick={() => onToggleExpand(item.id)}
            className={cn(
              "shrink-0 grid size-9 place-items-center rounded-full border transition-colors",
              expanded ? "bg-ink text-cream border-ink" : "border-ink/15 text-ink/50 hover:border-ink/30",
            )}
            aria-label={expanded ? `Chiudi dettagli ${item.name}` : `Espandi dettagli ${item.name}`}
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 rounded-xl border border-ink/10 bg-white/40 p-4 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[0.58rem] font-extrabold tracking-[0.1em] text-ink/35 uppercase">Categoria</p>
                <p className="mt-1 text-[0.82rem] font-medium">{item.categoryName || "—"}</p>
              </div>
              <div>
                <p className="text-[0.58rem] font-extrabold tracking-[0.1em] text-ink/35 uppercase">Allergeni</p>
                <p className="mt-1 text-[0.82rem] font-medium">
                  {item.allergens.length > 0
                    ? item.allergens
                        .map((code: string) => {
                          const a = allergens.find((al) => al.code === code);
                          return a ? a.shortName : code;
                        })
                        .join(", ")
                    : "Nessuno"}
                </p>
              </div>
              <div>
                <p className="text-[0.58rem] font-extrabold tracking-[0.1em] text-ink/35 uppercase">Descrizione completa</p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-ink/60">{item.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}