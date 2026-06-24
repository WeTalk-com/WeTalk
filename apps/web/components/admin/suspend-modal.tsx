"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { suspendUser, type SuspendUnit } from "@/lib/api/admin";
import { useToast } from "@/components/ui/toast-provider";

const UNITS: SuspendUnit[] = ["minutes", "hours", "days", "months", "years"];
const PRESETS: { amount: number; unit: SuspendUnit }[] = [
  { amount: 1, unit: "hours" },
  { amount: 24, unit: "hours" },
  { amount: 3, unit: "days" },
  { amount: 7, unit: "days" },
  { amount: 1, unit: "months" },
];

export function SuspendModal({
  userId,
  userHandle,
  onClose,
  onSuccess,
}: {
  userId: string;
  userHandle: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("app.admin");
  const toast = useToast();
  const [amount, setAmount] = useState(24);
  const [unit, setUnit] = useState<SuspendUnit>("hours");
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    if (pending) return;
    setPending(true);
    try {
      await suspendUser(userId, amount, unit);
      toast.success(t("suspendSuccess", { handle: userHandle }));
      onSuccess();
      onClose();
    } catch {
      toast.error(t("suspendError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog.Root open onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-card border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <Dialog.Title className="font-head text-lg font-bold text-brown">
                {t("suspendTitle")}
              </Dialog.Title>
              <Dialog.Close
                aria-label={t("cancel")}
                className="grid size-8 place-items-center rounded-full text-brown-sec hover:bg-canvas"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="mt-1 text-sm text-brown-sec">
              @{userHandle}
            </Dialog.Description>

            <div className="mt-4 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={`${p.amount}-${p.unit}`}
                  type="button"
                  onClick={() => { setAmount(p.amount); setUnit(p.unit); }}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${amount === p.amount && unit === p.unit ? "border-gold bg-gold/10 text-brown" : "border-border text-brown-sec hover:border-brown"}`}
                >
                  {p.amount} {t(`unit_${p.unit}`)}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={999}
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-brown outline-none focus:border-gold"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as SuspendUnit)}
                className="flex-1 rounded-xl border border-border bg-canvas px-3 py-2 text-sm text-brown outline-none focus:border-gold"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{t(`unit_${u}`)}</option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <Dialog.Close className="text-sm text-brown-sec hover:text-brown">
                {t("cancel")}
              </Dialog.Close>
              <Button
                disabled={pending || amount < 1}
                onClick={handleSubmit}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {t("suspendConfirm")}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
