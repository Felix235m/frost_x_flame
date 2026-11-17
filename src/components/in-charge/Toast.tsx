"use client";

import { cn } from "@/lib/utils";
import { useCallback, useState, type ReactNode } from "react";

export function Toast({
  open,
  title,
  message,
  onClose,
  variant = "success",
}: {
  open: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  variant?: "success" | "error" | "info";
}) {
  if (!open) return null;

  const config: Record<string, { bg: string; text: string; icon: string }> = {
    success: {
      bg: "bg-status-available/10 border border-status-available/30",
      text: "text-status-available",
      icon: "check_circle",
    },
    error: {
      bg: "bg-status-booked/10 border border-status-booked/30",
      text: "text-status-booked",
      icon: "error",
    },
    info: {
      bg: "bg-frost-cyan/10 border border-frost-cyan/30",
      text: "text-frost-cyan",
      icon: "info",
    },
  };
  const c = config[variant];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex w-full max-w-md items-center gap-3 rounded-xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-300">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-on-surface">
        <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
      </div>
      <div className={cn(c.bg, "flex-1 rounded-lg border px-3 py-2")}>
        <h4 className={`font-heading text-headline-sm font-bold ${c.text}`}>{title}</h4>
        {message ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">{message}</p>
        ) : null}
      </div>
      <button
        onClick={onClose}
        className="rounded-lg p-1.5 text-on-surface-variant hover:text-frost-cyan transition-colors"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: string; title: string; message?: string; variant: string }[]>([]);

  const show = useCallback((title: string, message?: string, variant: string = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, title, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            open
            title={t.title}
            message={t.message}
            variant={t.variant as "success" | "error" | "info"}
            onClose={() => dismiss(t.id)}
          />
        ))}
      </div>
    </>
  );
}
