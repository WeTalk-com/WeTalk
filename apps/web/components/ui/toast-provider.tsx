"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { X, CheckCircle, XCircle, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; title: string; type: ToastType; open: boolean };

type ToastFn = {
  success: (title: string) => void;
  error: (title: string) => void;
  info: (title: string) => void;
};

const ToastContext = createContext<ToastFn>({ success: () => {}, error: () => {}, info: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ item, onClose }: { item: ToastItem; onClose: (id: number) => void }) {
  const t = useTranslations("ui");

  return (
    <Toast.Root
      open={item.open}
      onOpenChange={(v) => { if (!v) onClose(item.id); }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-card",
        "data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out",
        item.type === "error" && "border-live/20 bg-card",
        item.type === "success" && "border-green-200 bg-card",
        item.type === "info" && "border-border bg-card",
      )}
    >
      {item.type === "success" && <CheckCircle className="size-4 shrink-0 text-green-500" />}
      {item.type === "error" && <XCircle className="size-4 shrink-0 text-live" />}
      {item.type === "info" && <Info className="size-4 shrink-0 text-gold" />}
      <Toast.Title
        className={cn(
          "flex-1 text-sm font-medium",
          item.type === "error" && "text-live",
          item.type === "success" && "text-green-700",
          item.type === "info" && "text-brown",
        )}
      >
        {item.title}
      </Toast.Title>
      <Toast.Close
        aria-label={t("toastClose")}
        className="shrink-0 rounded-full p-0.5 text-brown-sec transition-colors hover:text-brown"
      >
        <X className="size-3.5" />
      </Toast.Close>
    </Toast.Root>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const add = useCallback((title: string, type: ToastType) => {
    const id = Date.now();
    setItems((prev) => [...prev, { id, title, type, open: true }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const close = useCallback((id: number) => {
    setItems((prev) => prev.map((t) => t.id === id ? { ...t, open: false } : t));
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 200);
  }, []);

  const toast = useMemo<ToastFn>(() => ({
    success: (title) => add(title, "success"),
    error: (title) => add(title, "error"),
    info: (title) => add(title, "info"),
  }), [add]);

  return (
    <ToastContext.Provider value={toast}>
      <Toast.Provider swipeDirection="right" duration={4000}>
        {children}
        {items.map((item) => (
          <ToastItem key={item.id} item={item} onClose={close} />
        ))}
        <Toast.Viewport className="fixed bottom-4 right-4 z-[200] flex w-72 flex-col gap-2 outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
