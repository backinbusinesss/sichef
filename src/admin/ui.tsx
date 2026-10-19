import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
        checked ? "border-ember bg-ember/90" : "border-cream/20 bg-cream/10",
      )}
    >
      <span
        className={cn(
          "size-4 rounded-full bg-cream transition-transform",
          checked ? "translate-x-6 bg-ink" : "translate-x-1",
        )}
      />
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "max-h-[92svh] w-full overflow-y-auto rounded-t-3xl border border-cream/12 bg-ink-2 shadow-2xl sm:rounded-3xl",
          size === "sm" && "sm:max-w-md",
          size === "md" && "sm:max-w-2xl",
          size === "lg" && "sm:max-w-4xl",
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-cream/10 bg-ink-2/95 px-5 py-4 backdrop-blur-md">
          <h2 className="font-display text-xl">{title}</h2>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full border border-cream/15 text-cream/70 hover:border-cream/40 hover:text-cream"
            aria-label="Chiudi"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function Toast({
  message,
  tone = "success",
  onDone,
}: {
  message: string;
  tone?: "success" | "error";
  onDone: () => void;
}) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 3200);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-2.5 rounded-full border px-5 py-3 text-[0.8rem] font-semibold shadow-2xl backdrop-blur-md",
          tone === "success"
            ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200"
            : "border-flame/40 bg-flame/15 text-flame",
        )}
      >
        {tone === "success" ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <AlertTriangle className="size-4" />
        )}
        {message}
      </div>
    </div>,
    document.body,
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  return {
    toast,
    notify: (message: string, tone: "success" | "error" = "success") => setToast({ message, tone }),
    clear: () => setToast(null),
  };
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} />;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-cream/15 bg-cream/[0.02] px-6 py-14 text-center">
      <p className="font-display text-xl">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-[0.82rem] text-dim">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        accent
          ? "border-ember/30 bg-gradient-to-br from-ember/12 to-transparent"
          : "border-cream/10 bg-cream/[0.03]",
      )}
    >
      <p className="text-[0.58rem] font-bold tracking-[0.18em] text-dim uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[0.68rem] text-dim/70">{hint}</p>}
    </div>
  );
}
