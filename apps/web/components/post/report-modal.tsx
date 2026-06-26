"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { X, CheckCircle } from "lucide-react";
import type { ReportReason } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { reportPost } from "@/lib/api/posts";
import { useToast } from "@/components/ui/toast-provider";

const REASONS: ReportReason[] = [
  "spam",
  "harassment",
  "inappropriate",
  "misinformation",
  "other",
];

type State = "idle" | "pending" | "success" | "duplicate";

export function ReportModal({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const t = useTranslations("app.report");
  const toast = useToast();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [state, setState] = useState<State>("idle");

  async function handleSubmit() {
    if (!reason || state === "pending") return;
    setState("pending");
    try {
      const res = await reportPost(postId, reason, details.trim() || undefined);
      setState(res?.duplicate ? "duplicate" : "success");
    } catch {
      toast.error(t("errorText"));
      setState("idle");
    }
  }

  const isDone = state === "success" || state === "duplicate";

  return (
    <Dialog.Root open onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-card border border-border bg-card p-5 shadow-card">
            {isDone ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle className="size-12 text-green-500" />
                <p className="mt-4 text-lg font-semibold text-brown">
                  {state === "duplicate" ? t("duplicateTitle") : t("successTitle")}
                </p>
                <p className="mt-1 text-sm text-brown-sec">
                  {state === "duplicate" ? t("duplicateText") : t("successText")}
                </p>
                <Dialog.Close asChild>
                  <Button className="mt-6">{t("close")}</Button>
                </Dialog.Close>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-head text-lg font-bold text-brown">
                    {t("title")}
                  </Dialog.Title>
                  <Dialog.Close
                    aria-label={t("close")}
                    className="grid size-8 place-items-center rounded-full text-brown-sec"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="mt-1 text-sm text-brown-sec">
                  {t("subtitle")}
                </Dialog.Description>

                <fieldset className="mt-4 flex flex-col gap-2">
                  <legend className="sr-only">{t("reasonLabel")}</legend>
                  {REASONS.map((r) => (
                    <label
                      key={r}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors",
                        reason === r ? "border-gold bg-gold/10" : "border-border hover:bg-canvas",
                      )}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="sr-only"
                      />
                      <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full border-2", reason === r ? "border-gold" : "border-border")}>
                        {reason === r && <span className="size-2 rounded-full bg-gold" />}
                      </span>
                      <span className="text-sm text-brown">{t(`reason_${r}`)}</span>
                    </label>
                  ))}
                </fieldset>

                {reason === "other" && (
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={t("detailsPlaceholder")}
                    rows={3}
                    maxLength={280}
                    className="mt-3 w-full resize-none rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm text-brown outline-none placeholder:text-placeholder focus:border-gold"
                  />
                )}

                <div className="mt-5 flex items-center justify-end gap-3">
                  <Dialog.Close className="text-sm text-brown-sec hover:text-brown">
                    {t("cancel")}
                  </Dialog.Close>
                  <Button
                    disabled={!reason || state === "pending"}
                    onClick={handleSubmit}
                  >
                    {state === "pending" ? t("submitting") : t("submit")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
