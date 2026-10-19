import { useMemo, useState } from "react";
import { useAdminAuth, errorMessage } from "./useAdmin";
import { Spinner } from "./ui";
import { Logo } from "@/components/Logo";
import { AdminLayout } from "./AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { MenuManager } from "./pages/MenuManager";
import { ReservationsManager } from "./pages/ReservationsManager";
import { OrdersManager } from "./pages/OrdersManager";
import { LoyaltyManager } from "./pages/LoyaltyManager";
import { MessagesManager } from "./pages/MessagesManager";
import { ContentManager } from "./pages/ContentManager";
import { SettingsManager } from "./pages/SettingsManager";
import { Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export type AdminSection =
  | "dashboard"
  | "reservations"
  | "orders"
  | "menu"
  | "loyalty"
  | "messages"
  | "content"
  | "settings";

export function AdminApp() {
  const { user, loading, login, logout } = useAdminAuth();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const content = useMemo(() => {
    switch (section) {
      case "menu":
        return <MenuManager />;
      case "reservations":
        return <ReservationsManager />;
      case "orders":
        return <OrdersManager />;
      case "loyalty":
        return <LoyaltyManager />;
      case "messages":
        return <MessagesManager />;
      case "content":
        return <ContentManager />;
      case "settings":
        return <SettingsManager />;
      default:
        return <Dashboard onNavigate={setSection} />;
    }
  }, [section]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink">
        <Spinner className="size-6 text-ember" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-4">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-flame/15 blur-[130px]" />
        <div className="relative w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo tone="light" />
          </div>
          <div className="rounded-[26px] border border-cream/12 bg-ink-2/80 p-7 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full border border-ember/40 bg-ember/10 text-ember">
                <Lock className="size-4" />
              </span>
              <div>
                <h1 className="font-display text-2xl leading-none">Area riservata</h1>
                <p className="mt-1 text-[0.72rem] text-dim">Menu, prenotazioni, ordini e contenuti</p>
              </div>
            </div>

            <form
              className="mt-7 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setSubmitting(true);
                setError(null);
                try {
                  await login(email, password);
                } catch (err) {
                  setError(errorMessage(err));
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div>
                <label className="field-label field-label-dark" htmlFor="admin-email">Email</label>
                <input id="admin-email" type="email" required autoComplete="username" className="field field-dark" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@ristorantesichef.com" />
              </div>
              <div>
                <label className="field-label field-label-dark" htmlFor="admin-password">Password</label>
                <input id="admin-password" type="password" required autoComplete="current-password" className="field field-dark" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
              </div>

              {error && <div className="rounded-xl border border-flame/40 bg-flame/10 px-3.5 py-2.5 text-[0.78rem] text-red-200">{error}</div>}

              <button type="submit" disabled={submitting} className="btn btn-clay w-full">
                {submitting ? <Spinner /> : "Entra"}
                {!submitting && <ArrowRight className="size-4" />}
              </button>
            </form>
          </div>

          <Link to="/" className="mt-6 block text-center text-[0.68rem] tracking-[0.16em] text-dim uppercase hover:text-cream">
            ← Torna al sito
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout section={section} onNavigate={setSection} user={user} onLogout={logout}>
      {content}
    </AdminLayout>
  );
}
