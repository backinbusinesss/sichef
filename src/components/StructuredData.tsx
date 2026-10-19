import { useRestaurantJsonLd, useMenuJsonLd, useEventsJsonLd } from "@/lib/content";

/** Componente che inietta i JSON-LD strutturati per SEO. */
export function StructuredData() {
  const restaurant = useRestaurantJsonLd();
  const menu = useMenuJsonLd();
  const events = useEventsJsonLd();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurant) }} />
      {menu && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(menu) }} />}
      {events && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(events) }} />}
    </>
  );
}