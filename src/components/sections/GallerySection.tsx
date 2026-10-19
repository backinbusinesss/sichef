import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SectionHeading, Reveal } from "@/components/Reveal";
import { GalleryGrid } from "@/components/GalleryGrid";
import { useContent } from "@/lib/content";

export function GallerySection() {
  const { content } = useContent();
  const images = (content?.gallery ?? []).slice(0, 6);

  return (
    <section id="galleria" className="bg-cream py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Uno sguardo"
          title="La nostra"
          italic="tavola."
          description="Sala, cucina, pizzeria e le facce di chi ogni giorno mette passione in quello che fa. Perché un ristorante è prima di tutto un posto dove stare bene."
          action={
            <Link to="/galleria" className="btn btn-ghost">
              Tutte le foto
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <Reveal delay={100} className="mt-12">
          <GalleryGrid images={images} className="md:grid-cols-3" />
        </Reveal>
      </div>
    </section>
  );
}
