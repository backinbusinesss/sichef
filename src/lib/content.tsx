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
