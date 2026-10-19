import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChartNoAxesColumn,
  ExternalLink,
  Gift,
  Inbox,
  LogOut,
  Menu,
  Settings2,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AdminSection } from "./AdminApp";
import type { AdminUser } from "./useAdmin";

const NAV: { id: AdminSection; label: string; icon: typeof Menu }[] = [
  { id: "dashboard", label: "Dashboard", icon: ChartNoAxesColumn },
  { id: "reservations", label: "Prenotazioni", icon: CalendarDays },
  { id: "orders", label: "Ordini", icon: ShoppingBag },
  { id: "menu", label: "Menu & allergeni", icon: UtensilsCrossed },
  { id: "loyalty", label: "Fedeltà", icon: Gift },
  { id: "messages", label: "Messaggi", icon: Inbox },
  { id: "content", label: "Contenuti", icon: Sparkles },
  { id: "settings", label: "Impostazioni", icon: Settings2 },
];

export function AdminLayout({
  section,
  onNavigate,
  user,
  onLogout,
  children,
}: {
  section: AdminSection;
  onNavigate: (section: AdminSection) => void;
  user: AdminUser;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-cream">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-cream/10 bg-ink/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <button onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-lg border border-cream/15" aria-label="Apri menu">
          <Menu className="size-4" />
        </button>
        <span className="font-display text-lg">Sì Chef · Admin</span>
        <Link to="/" className="text-dim hover:text-cream" aria-label="Vai al sito">
          <ExternalLink className="size-4" />
        </Link>
      </div>

      <div className="flex">
        <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-cream/10 bg-ink-2 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex items-center justify-between px-5 py-5">
            <div>
              <p className="font-display text-xl leading-none">Sì Chef</p>
              <p className="mt-1 text-[0.55rem] font-bold tracking-[0.24em] text-ember uppercase">Backoffice</p>
            </div>
            <button onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-lg border border-cream/15 lg:hidden" aria-label="Chiudi menu">
              <X className="size-4" />
            </button>
          </div>

          <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.82rem] font-semibold transition-colors",
                    active ? "bg-ember/12 text-ember" : "text-cream/65 hover:bg-cream/5 hover:text-cream",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                  {active && <span className="ml-auto size-1.5 rounded-full bg-ember" />}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-cream/10 p-3">
            <div className="rounded-xl bg-cream/[0.03] p-3">
              <p className="truncate text-[0.78rem] font-semibold">{user.name}</p>
              <p className="truncate text-[0.65rem] text-dim">{user.email}</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link to="/" className="flex items-center justify-center gap-1.5 rounded-lg border border-cream/15 py-2 text-[0.62rem] font-bold tracking-[0.08em] text-cream/70 uppercase hover:border-cream/35 hover:text-cream">
                <ExternalLink className="size-3" /> Sito
              </Link>
              <button onClick={onLogout} className="flex items-center justify-center gap-1.5 rounded-lg border border-cream/15 py-2 text-[0.62rem] font-bold tracking-[0.08em] text-cream/70 uppercase hover:border-flame/50 hover:text-flame">
                <LogOut className="size-3" /> Esci
              </button>
            </div>
          </div>
        </aside>

        {open && <div className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
