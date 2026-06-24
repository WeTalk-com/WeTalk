"use client";

import { useState, useEffect, useRef, useId } from "react";
import { Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { deleteAccount } from "@/lib/api";
import { logout } from "@/lib/api/auth";

export function DeleteAccountButton() {
  const t = useTranslations("settings");
  const router = useRouter();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const keyword = t("deleteAccountKeyword");
  const confirmed = input === keyword;

  function handleOpen() {
    setInput("");
    setError(false);
    setOpen(true);
  }

  function handleClose() {
    if (pending) return;
    setOpen(false);
  }

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  async function handleConfirm() {
    if (!confirmed || pending) return;
    setPending(true);
    setError(false);
    try {
      await deleteAccount();
      // Best-effort logout pour vider le cookie, même si le compte n'existe plus.
      await logout().catch(() => {});
      router.replace("/login");
      router.refresh();
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-full border border-live/40 bg-live/10 px-5 py-2.5 text-sm font-semibold text-live transition-colors hover:bg-live/15"
      >
        <Trash2 className="size-4" />
        {t("deleteAccountButton")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-2xl bg-canvas p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="font-display text-lg font-bold text-brown">
                {t("deleteAccountTitle")}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={pending}
                aria-label={t("deleteAccountCancel")}
                className="shrink-0 rounded-full p-1 text-brown-sec hover:bg-card disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mt-3 text-sm text-brown-sec">
              {t("deleteAccountText", { keyword })}
            </p>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder={t("deleteAccountPlaceholder")}
              disabled={pending}
              className="mt-4 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-brown placeholder:text-brown-sec/50 focus:outline-none focus:ring-2 focus:ring-live/40 disabled:opacity-50"
            />

            {error && (
              <p className="mt-2 text-xs text-live">{t("deleteAccountError")}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={pending}
                className="rounded-full px-4 py-2 text-sm text-brown-sec hover:bg-card disabled:opacity-50"
              >
                {t("deleteAccountCancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!confirmed || pending}
                className="flex items-center gap-2 rounded-full bg-live px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-live/90 disabled:opacity-40"
              >
                {pending ? "…" : t("deleteAccountSubmit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
