import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ContentProvider, useContent } from "@/lib/content";
import { Spinner } from "@/admin/ui";

const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const MenuPage = lazy(() => import("@/pages/MenuPage").then((m) => ({ default: m.MenuPage })));
const LunchPage = lazy(() => import("@/pages/LunchPage").then((m) => ({ default: m.LunchPage })));
const OrderPage = lazy(() => import("@/pages/OrderPage").then((m) => ({ default: m.OrderPage })));
const ReservePage = lazy(() => import("@/pages/ReservePage").then((m) => ({ default: m.ReservePage })));
const LoyaltyPage = lazy(() => import("@/pages/LoyaltyPage").then((m) => ({ default: m.LoyaltyPage })));
const EventsPage = lazy(() => import("@/pages/EventsPage").then((m) => ({ default: m.EventsPage })));
const GalleryPage = lazy(() => import("@/pages/GalleryPage").then((m) => ({ default: m.GalleryPage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("@/pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));
const AdminApp = lazy(() => import("@/admin/AdminApp").then((m) => ({ default: m.AdminApp })));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        window.setTimeout(() => {
          const top = element.getBoundingClientRect().top + window.scrollY - 84;
          window.scrollTo({ top, behavior: "smooth" });
        }, 60);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function Seo() {
  const { content } = useContent();
  const seo = content?.settings.seo;
  useEffect(() => {
    if (!seo) return;
    document.title = seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", seo.description);
  }, [seo]);
  return null;
}

function BrandLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-6 text-ember" />
        <p className="text-[0.6rem] font-bold tracking-[0.3em] text-cream/45 uppercase">
          Ristorante Sì Chef
        </p>
      </div>
    </div>
  );
}

function SectionLoader() {
  return (
    <div className="grid min-h-[60svh] place-items-center bg-cream">
      <Spinner className="size-6 text-flame" />
    </div>
  );
}

function SiteShell() {
  const { loading, error, content } = useContent();

  if (loading) return <BrandLoader />;

  if (error || !content) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink px-6">
        <div className="max-w-md text-center text-cream">
          <h1 className="font-display text-3xl">Qualcosa non ha funzionato.</h1>
          <p className="mt-3 text-[0.9rem] text-cream/50">
            {error ?? "Contenuti non disponibili."} Riprova tra poco o chiamaci.
          </p>
          <button onClick={() => window.location.reload()} className="btn btn-clay mt-6">
            Ricarica
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="paper-grain min-h-screen bg-cream">
        <StructuredData />
        <Header />
        <main>
        <Suspense fallback={<SectionLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/il-nostro-menu" element={<MenuPage />} />
            <Route path="/menu-pranzo" element={<LunchPage />} />
            <Route path="/pranzo" element={<LunchPage />} />
            <Route path="/ordina" element={<OrderPage />} />
            <Route path="/ordina-online" element={<OrderPage />} />
            <Route path="/prenota" element={<ReservePage />} />
            <Route path="/fedelta" element={<LoyaltyPage />} />
            <Route path="/programma-fedelta" element={<LoyaltyPage />} />
            <Route path="/eventi" element={<EventsPage />} />
            <Route path="/eventi-e-cerimonie" element={<EventsPage />} />
            <Route path="/galleria" element={<GalleryPage />} />
            <Route path="/chi-siamo" element={<AboutPage />} />
            <Route path="/contatti" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  </ErrorBoundary>
);
}

export default function App() {
  return (
    <ContentProvider>
      <ScrollToTop />
      <Seo />
      <Suspense fallback={<BrandLoader />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={<SiteShell />} />
        </Routes>
      </Suspense>
    </ContentProvider>
  );
}
