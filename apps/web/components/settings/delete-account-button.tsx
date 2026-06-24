"use client";

import { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { deleteAccount } from "@/lib/api";
import { logout } from "@/lib/api/auth";

export function DeleteAccountButton() {
  const t = useTranslations("settings");
  const router = useRouter();

  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const keyword = t("deleteAccountKeyword");
  const confirmed = input === keyword;

  async function handleConfirm() {
    if (!confirmed || pending) return;
    setPending(true);
    setError(false);
    try {
      await deleteAccount();
      await logout().catch(() => {});
      router.replace("/login");
      router.refresh();
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return (
    <AlertDialog.Root onOpenChange={(v) => { if (v) { setInput(""); setError(false); } }}>
      <AlertDialog.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-live/40 bg-live/10 px-5 py-2.5 text-sm font-semibold text-live transition-colors hover:bg-live/15"
        >
          <Trash2 className="size-4" />
          {t("deleteAccountButton")}
        </button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <AlertDialog.Content className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-canvas p-6 shadow-xl">
            <AlertDialog.Title className="font-display text-lg font-bold text-brown">
              {t("deleteAccountTitle")}
            </AlertDialog.Title>

            <AlertDialog.Description className="mt-3 text-sm text-brown-sec">
              {t("deleteAccountText", { keyword })}
            </AlertDialog.Description>

            <input
              type="text"
              autoFocus
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder={t("deleteAccountPlaceholder")}
              disabled={pending}
              className="mt-4 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-brown placeholder:text-brown-sec/50 focus:outline-none focus:ring-2 focus:ring-live/40 disabled:opacity-50"
            />

            {error && <p className="mt-2 text-xs text-live">{t("deleteAccountError")}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  disabled={pending}
                  className="rounded-full px-4 py-2 text-sm text-brown-sec hover:bg-card disabled:opacity-50"
                >
                  {t("deleteAccountCancel")}
                </button>
              </AlertDialog.Cancel>
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
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
