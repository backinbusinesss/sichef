import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { AllergenBadges, DietTags } from "@/components/AllergenBadges";
import { useContent } from "@/lib/content";
import { euro } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

export function SignatureSection() {
  const { content } = useContent();
  if (!content) return null;

  const featured = content.items
    .filter((item) => item.isFeatured && item.isAvailable)
    .slice(0, 6);

  const card = (item: MenuItem, large = false) => (
    <article
      key={item.id}
      className={`group flex flex-col overflow-hidden rounded-[1.4rem] border border-ink/10 bg-paper shadow-[0_24px_60px_-45px_rgba(20,37,30,.5)] transition-transform duration-500 hover:-translate-y-1 ${
        large ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      {item.imageUrl && (
        <div className={`relative overflow-hidden ${large ? "aspect-[4/3] md:aspect-[16/11]" : "aspect-[4/3]"}`}>
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
          <span className="absolute top-4 left-4 rounded-full border border-cream/25 bg-ink/40 px-3 py-1.5 text-[0.52rem] font-extrabold tracking-[0.14em] text-cream/90 uppercase backdrop-blur-md">
            Dalla nostra cucina
          </span>
        </div>
      )}
      <div className={`flex flex-1 flex-col p-5 ${large ? "md:p-7" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <h3 className={`${large ? "text-3xl md:text-4xl" : "text-[1.45rem]"} leading-[1.02]`}>
            {item.name}
          </h3>
          <span className={`${large ? "text-2xl" : "text-lg"} shrink-0 font-display font-semibold text-flame`}>
            {euro(item.price)}
          </span>
        </div>
        <p className={`mt-2.5 leading-relaxed text-ink/50 ${large ? "text-[0.9rem]" : "text-[0.78rem]"}`}>
          {item.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <DietTags item={item} />
          <AllergenBadges codes={item.allergens} allergens={content.allergens} />
        </div>
      </div>
    </article>
  );

  const [first, ...rest] = featured;

  return (
    <section id="menu" className="relative overflow-hidden bg-paper-2/60 py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Le nostre firme"
          title="Piatti che"
          italic="parlano da soli."
          description="Alcune cose non cambiano mai: il profumo del fritto appena fatto, la pasta mantecata al momento, la pizza che esce dal forno. Questi sono i piatti che ci raccontano meglio."
          action={
            <Link to="/menu" className="btn btn-ghost">
              Menu completo
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {first && card(first, true)}
          {rest.map((item) => card(item))}
        </div>

        <Reveal delay={100}>
          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-ink/10 bg-paper px-5 py-4 sm:flex-row sm:items-center">
            <p className="flex items-center gap-3 text-[0.78rem] text-ink/55">
              <span className="grid size-8 place-items-center rounded-full bg-flame/10 text-flame">
                <Flame className="size-3.5" />
              </span>
              Hai un'allergia o un'intolleranza? Parlane con noi: in cucina troviamo la soluzione.
            </p>
            <Link to="/contatti" className="link-underline text-[0.64rem] font-extrabold tracking-[0.12em] text-flame uppercase">
              Contattaci
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
