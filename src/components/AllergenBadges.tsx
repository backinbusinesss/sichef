import { Leaf, WheatOff, Flame } from "lucide-react";
import type { Allergen, MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const CODES: Record<string, string> = {
  gluten: "GL",
  crustaceans: "CR",
  eggs: "UO",
  fish: "PE",
  peanuts: "AR",
  soy: "SO",
  milk: "LA",
  nuts: "FG",
  celery: "SE",
  mustard: "SN",
  sesame: "SS",
  sulphites: "SF",
  lupin: "LU",
  molluscs: "MO",
};

export function AllergenBadges({
  codes,
  allergens,
  className,
}: {
  codes: string[];
  allergens: Allergen[];
  className?: string;
}) {
  if (!codes.length) return null;
  const map = new Map(allergens.map((a) => [a.code, a]));
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      {codes.map((code) => {
        const allergen = map.get(code);
        return (
          <span
            key={code}
            className="allergen-pill"
            title={allergen ? `${allergen.name}: ${allergen.description}` : code}
          >
            {CODES[code] ?? code.slice(0, 2).toUpperCase()}
          </span>
        );
      })}
    </span>
  );
}

export function DietTags({ item, className }: { item: MenuItem; className?: string }) {
  const tags: { label: string; icon: typeof Leaf; tone: string }[] = [];
  if (item.isVegan) tags.push({ label: "Vegano", icon: Leaf, tone: "border-emerald-700/20 bg-emerald-700/8 text-emerald-800" });
  else if (item.isVegetarian) tags.push({ label: "Vegetariano", icon: Leaf, tone: "border-emerald-700/20 bg-emerald-700/8 text-emerald-800" });
  if (item.isGlutenFree) tags.push({ label: "Senza glutine", icon: WheatOff, tone: "border-amber-700/20 bg-amber-600/8 text-amber-800" });
  if (item.isSpicy) tags.push({ label: "Piccante", icon: Flame, tone: "border-flame/20 bg-flame/8 text-flame" });
  if (!tags.length) return null;
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {tags.map((tag) => (
        <span
          key={tag.label}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[0.55rem] font-extrabold tracking-[0.06em] uppercase",
            tag.tone,
          )}
        >
          <tag.icon className="size-2.5" />
          {tag.label}
        </span>
      ))}
    </span>
  );
}

export function AllergenLegend({ allergens }: { allergens: Allergen[] }) {
  return (
    <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {allergens.map((allergen) => (
        <div key={allergen.code} className="flex items-start gap-2.5 text-[0.76rem]">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-ink/12 bg-white/50 text-[0.6rem] font-extrabold text-ink/60">
            {CODES[allergen.code] ?? allergen.code.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <span className="font-semibold text-ink/80">{allergen.name}</span>
            <span className="ml-1 text-ink/45">— {allergen.shortName}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function allergenLabel(code: string, allergens: Allergen[]) {
  return allergens.find((a) => a.code === code)?.name ?? code;
}

export { CODES as ALLERGEN_CODES };
