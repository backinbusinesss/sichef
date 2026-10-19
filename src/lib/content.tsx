import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { SiteContent } from "./types";
import { api } from "./api";

type ContentState = {
  content: SiteContent | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const ContentContext = createContext<ContentState | null>(null);

let cache: SiteContent | null = null;

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const data = await api.get<SiteContent>("/api/content");
      cache = data;
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di caricamento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cache) void load();
    else setLoading(false);
  }, []);

  const value = useMemo<ContentState>(
    () => ({ content, loading, error, refresh: load }),
    [content, loading, error],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent deve essere usato dentro ContentProvider");
  return ctx;
}

export function useVenue() {
  const { content } = useContent();
  return content?.settings.venue;
}

export function useLoyaltySettings() {
  const { content } = useContent();
  return content?.settings.loyalty;
}

export function useOrderSettings() {
  const { content } = useContent();
  return content?.settings.order;
}

/** Genera JSON-LD strutturato per il ristorante. */
export function useRestaurantJsonLd() {
  const venue = useVenue();
  const hours = useContent().content?.hours ?? [];

  const openingHours = hours.map((h) => {
    if (h.isClosed) return null;
    const spec: Record<string, string | string[]> = {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.label,
    };
    if (h.lunchOpen && h.lunchClose) {
      spec.opens = h.lunchOpen;
      spec.closes = h.lunchClose;
    }
    if (h.dinnerOpen && h.dinnerClose) {
      if (spec.opens) {
        // Se c'è sia pranzo che cena, creiamo due specifiche
        return [
          { ...spec, opens: h.lunchOpen, closes: h.lunchClose },
          { "@type": "OpeningHoursSpecification", dayOfWeek: h.label, opens: h.dinnerOpen, closes: h.dinnerClose },
        ];
      }
      spec.opens = h.dinnerOpen;
      spec.closes = h.dinnerClose;
    }
    return spec;
  }).flat().filter(Boolean);

  return useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Ristorante Sì Chef",
    image: "/assets/img/hero.webp",
    servesCuisine: ["Italiana", "Pizza", "Pesce"],
    priceRange: "€€",
    telephone: venue?.phone ? `+39 ${venue.phone.replace(/\s/g, "")}` : "+39 0331 519111",
    email: venue?.email ?? "ristorantesichef@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Via S. Clemente 151",
      postalCode: "20023",
      addressLocality: "Cerro Maggiore",
      addressRegion: "MI",
      addressCountry: "IT",
    },
    url: "https://www.ristorantesichef.com",
    acceptsReservations: true,
    openingHoursSpecification: openingHours,
  }), [venue, hours]);
}

/** Genera JSON-LD per il menu (MenuSection). */
export function useMenuJsonLd() {
  const content = useContent().content;
  const categories = content?.categories ?? [];
  const items = content?.items ?? [];

  const hasMenu = items.length > 0;

  return useMemo(() => {
    if (!hasMenu) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Menu",
      name: "Menu Ristorante Sì Chef",
      description: "Menu completo con piatti di cucina italiana, pizza e pesce fresco",
      hasMenuSection: categories.map((cat) => ({
        "@type": "MenuSection",
        name: cat.name,
        description: cat.description,
        hasMenuItem: items
          .filter((item) => item.categoryId === cat.id && item.isAvailable)
          .map((item) => ({
            "@type": "MenuItem",
            name: item.name,
            description: item.description,
            offers: {
              "@type": "Offer",
              price: item.price.toFixed(2),
              priceCurrency: "EUR",
            },
            suitableForDiet: [
              item.isVegetarian && "https://schema.org/VegetarianDiet",
              item.isVegan && "https://schema.org/VeganDiet",
              item.isGlutenFree && "https://schema.org/GlutenFreeDiet",
            ].filter(Boolean),
          })),
      })),
    };
  }, [categories, items]);
}

/** Genera JSON-LD per gli eventi. */
export function useEventsJsonLd() {
  const events = useContent().content?.events ?? [];

  return useMemo(() => {
    if (events.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Eventi e cerimonie Ristorante Sì Chef",
      itemListElement: events.map((event, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Event",
          name: event.title,
          description: event.description,
          startDate: event.eventDate ? `${event.eventDate}T${event.eventTime}` : undefined,
          location: {
            "@type": "Place",
            name: "Ristorante Sì Chef",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Via S. Clemente 151",
              postalCode: "20023",
              addressLocality: "Cerro Maggiore",
              addressRegion: "MI",
              addressCountry: "IT",
            },
          },
          image: event.imageUrl,
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            priceCurrency: "EUR",
          },
        },
      })),
    };
  }, [events]);
}
