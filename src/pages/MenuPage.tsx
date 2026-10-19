import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CalendarCheck, Search, X } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { AllergenBadges, AllergenLegend, DietTags } from "@/components/AllergenBadges";
import { useContent } from "@/lib/content";
import { cn, euro, scrollToId } from "@/lib/utils";

export function MenuPage() {
  const { content } = useContent();
  const [query, setQuery] = useState("");
  const [excluded, setExcluded] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = content?.categories ?? [];
  const items = content?.items ?? [];
  const allergens = content?.allergens ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (excluded.length > 0 && item.allergens.some((code) => excluded.includes(code))) return false;
      if (q && !`${item.name} ${item.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, excluded, query]);

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

      <div className="sticky top-[4.6rem] z-30 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
        <div className="shell flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => scrollToId(`cat-${category.slug}`)}
              className="shrink-0 rounded-full border border-ink/12 bg-white/40 px-3.5 py-1.5 text-[0.58rem] font-extrabold tracking-[0.1em] text-ink/60 uppercase transition-colors hover:border-flame/50 hover:text-flame"
            >
              {category.emoji} {category.name}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-cream py-12 md:py-16">
        <div className="shell">
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
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-ink/35 hover:text-flame"
                  aria-label="Cancella ricerca"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setFiltersOpen((value) => !value)}
              className={cn(
                "btn btn-ghost btn-sm shrink-0",
                (filtersOpen || excluded.length > 0) && "border-flame/50 text-flame",
              )}
            >
              <AlertTriangle className="size-3.5" />
              Escludi allergeni
              {excluded.length > 0 && (
                <span className="grid size-4 place-items-center rounded-full bg-flame text-[0.52rem] text-white">
                  {excluded.length}
                </span>
              )}
            </button>
            <span className="text-[0.62rem] font-bold tracking-[0.12em] text-ink/35 uppercase">
              {filtered.length} piatti
            </span>
          </div>

          {filtersOpen && (
            <div className="mt-4 rounded-2xl border border-ink/10 bg-paper p-5">
              <p className="text-[0.76rem] leading-relaxed text-ink/55">
                Seleziona gli allergeni da <strong className="text-ink">escludere</strong>: i piatti
                che li contengono verranno nascosti. Per allergie gravi parlane sempre con il
                personale prima di ordinare.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
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
                    >
                      {allergen.shortName}
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

                <div className="mt-2 grid gap-x-12 md:grid-cols-2">
                  {groupItems.map((item) => (
                    <article key={item.id} className="menu-item-row group">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-[1.15rem] leading-tight font-semibold text-ink/85">
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
                      <p className="max-w-xl text-[0.78rem] leading-relaxed text-ink/50">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <DietTags item={item} />
                        <AllergenBadges codes={item.allergens} allergens={allergens} />
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}

            {grouped.length === 0 && (
              <div className="rounded-3xl border border-ink/10 bg-paper py-16 text-center">
                <p className="font-display text-2xl">Nessun piatto trovato</p>
                <p className="mt-2 text-sm text-ink/45">Prova a rimuovere qualche filtro.</p>
                <button
                  onClick={() => {
                    setExcluded([]);
                    setQuery("");
                  }}
                  className="btn btn-ghost btn-sm mt-5"
                >
                  Azzera tutto
                </button>
              </div>
            )}
          </div>

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
