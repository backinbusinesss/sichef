import { Hero } from "@/components/sections/Hero";
import { StorySection } from "@/components/sections/StorySection";
import { SignatureSection } from "@/components/sections/SignatureSection";
import { LunchSection } from "@/components/sections/LunchSection";
import { OrderBanner } from "@/components/sections/OrderBanner";
import { PromosSection } from "@/components/sections/PromosSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { LocationSection } from "@/components/sections/LocationSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { Marquee } from "@/components/Marquee";
import { useContent } from "@/lib/content";

export function HomePage() {
  const { content } = useContent();
  const marquee = content?.settings.hero?.marquee ?? [];
  const items = marquee.length
    ? marquee
    : ["Cucina italiana", "Pizza artigianale", "Pesce fresco", "Menù pranzo 13 €", "Aperto 7 giorni su 7"];

  return (
    <>
      <Hero />
      <div className="border-y border-cream/10 bg-ink text-cream/80">
        <Marquee items={items} slow />
      </div>
      <StorySection />
      <SignatureSection />
      <LunchSection />
      <OrderBanner />
      <PromosSection />
      <GallerySection />
      <ReviewsSection />
      <EventsSection />
      <LocationSection />
      <NewsletterSection />
    </>
  );
}
