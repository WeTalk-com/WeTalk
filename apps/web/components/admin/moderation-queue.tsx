"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Trash2, Ban, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReportedPost } from "@/lib/types";
import { dismissReport, removeReportedPost, banUser } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast-provider";
import { SuspendModal } from "./suspend-modal";

export function ModerationQueue({
  initialReports,
}: {
  initialReports: ReportedPost[];
}) {
  const t = useTranslations("app.admin");
  const tReport = useTranslations("app.report");
  const toast = useToast();
  const router = useRouter();
  const [reports, setReports] = useState(initialReports);
  const [suspendTarget, setSuspendTarget] = useState<{
    userId: string;
    userHandle: string;
    reportId: string;
  } | null>(null);

  function remove(reportId: string) {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  }

  async function handleDismiss(reportId: string) {
    const previous = reports;
    remove(reportId);
    try {
      await dismissReport(reportId);
      router.refresh();
    } catch {
      setReports(previous);
      toast.error(t("actionError"));
    }
  }

  async function handleRemove(reportId: string) {
    const previous = reports;
    remove(reportId);
    try {
      await removeReportedPost(reportId);
      router.refresh();
    } catch {
      setReports(previous);
      toast.error(t("actionError"));
    }
  }

  async function handleBan(reportId: string, userId: string, userHandle: string) {
    const previous = reports;
    remove(reportId);
    try {
      await banUser(userId);
      await dismissReport(reportId);
      toast.success(t("banSuccess", { handle: userHandle }));
      router.refresh();
    } catch {
      setReports(previous);
      toast.error(t("banError"));
    }
  }

  async function handleSuspendSuccess(reportId: string) {
    remove(reportId);
    await dismissReport(reportId).catch(() => {});
    router.refresh();
    setSuspendTarget(null);
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-brown-sec">
        <CheckCheck className="size-10 opacity-30" />
        <p className="text-sm">{t("noReports")}</p>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {reports.map((report) => {
          const author = report.post?.author;
          return (
            <li key={report.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <Avatar initial={author?.initial ?? "?"} src={author?.avatarUrl} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brown">
                    {author?.name ?? t("unknownUser")}{" "}
                    <span className="font-normal text-brown-sec">
                      {author?.handle ? `@${author.handle}` : ""}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-ink">{report.post?.text ?? "—"}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-brown-sec">
                <span>
                  <strong className="text-brown">{t("reasonLabel")}</strong>{" "}
                  <span className="rounded-full bg-live/10 px-2 py-0.5 font-medium text-live">
                    {tReport(`reason_${report.reason}`)}
                  </span>
                </span>
                {report.reporter && (
                  <span>
                    {t("reportedBy")}{" "}
                    <strong className="text-brown">@{report.reporter.handle}</strong>
                  </span>
                )}
                <span className="ml-auto">{report.reportedAt}</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDismiss(report.id)}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-brown-sec transition-colors hover:border-brown hover:text-brown"
                >
                  <CheckCheck className="size-3.5" />
                  {t("dismiss")}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(report.id)}
                  className="flex items-center gap-1.5 rounded-full bg-live/10 px-3 py-1.5 text-xs font-medium text-live transition-colors hover:bg-live/20"
                >
                  <Trash2 className="size-3.5" />
                  {t("remove")}
                </button>
                {author?.id && (
                  <>
                    {author.isBanned ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-live/20 px-3 py-1.5 text-xs font-medium text-live">
                        <Ban className="size-3.5" />
                        {t("banned")}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (author.id) {
                            void handleBan(report.id, author.id, author.handle);
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-full bg-live px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-live/90"
                      >
                        <Ban className="size-3.5" />
                        {t("banAuthor")}
                      </button>
                    )}
                    {author.isSuspended ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-600">
                        <Clock className="size-3.5" />
                        {t("suspended")}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSuspendTarget({
                            userId: author.id!,
                            userHandle: author.handle,
                            reportId: report.id,
                          })
                        }
                        className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/20"
                      >
                        <Clock className="size-3.5" />
                        {t("suspendAuthor")}
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {suspendTarget && (
        <SuspendModal
          userId={suspendTarget.userId}
          userHandle={suspendTarget.userHandle}
          onClose={() => setSuspendTarget(null)}
          onSuccess={() => void handleSuspendSuccess(suspendTarget.reportId)}
        />
      )}
    </>
  );
}
