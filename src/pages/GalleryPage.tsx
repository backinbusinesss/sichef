import { GalleryGrid } from "@/components/GalleryGrid";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { useContent } from "@/lib/content";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function GalleryPage() {
  const { content } = useContent();
  const images = content?.gallery ?? [];

  return (
    <>
      <PageHero
        eyebrow="Galleria"
        title="La nostra"
        italic="tavola."
        description="Sala, cucina, pizzeria e le facce di chi ogni giorno mette passione in quello che fa. Uno sguardo dentro il Sì Chef."
        image="/assets/img/interior.webp"
        crumb="Galleria"
      />
      <section className="bg-cream py-14 md:py-20">
        <div className="shell">
          <Reveal>
            <GalleryGrid images={images} lightbox />
          </Reveal>
          <Reveal className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-ink/10 bg-paper p-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-2xl">Vuoi vedere la sala dal vivo?</p>
              <p className="mt-1 text-[0.82rem] text-ink/45">Prenota un tavolo o passa a trovarci: il resto lo scopri di persona.</p>
            </div>
            <div className="flex gap-2">
              <Link to="/prenota" className="btn btn-clay">Prenota</Link>
              <Link to="/menu" className="btn btn-ghost">Menu <ArrowRight className="size-3.5" /></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
