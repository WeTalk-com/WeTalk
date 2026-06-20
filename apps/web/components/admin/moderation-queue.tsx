"use client";

import { useState } from "react";
import { CheckCheck, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReportedPost } from "@/lib/types";
import { dismissReport, removeReportedPost } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";

export function ModerationQueue({
  initialReports,
}: {
  initialReports: ReportedPost[];
}) {
  const t = useTranslations("app.admin");
  const tReport = useTranslations("app.report");
  const [reports, setReports] = useState(initialReports);

  async function handleDismiss(reportId: string) {
    const previous = reports;
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    try {
      await dismissReport(reportId);
    } catch {
      setReports(previous);
    }
  }

  async function handleRemove(reportId: string) {
    const previous = reports;
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    try {
      await removeReportedPost(reportId);
    } catch {
      setReports(previous);
    }
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
    <ul className="flex flex-col gap-4">
      {reports.map((report) => (
        <li key={report.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Avatar initial={report.post.author.initial} size={36} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brown">
                {report.post.author.name}{" "}
                <span className="font-normal text-brown-sec">
                  @{report.post.author.handle}
                </span>
              </p>
              <p className="mt-1 text-sm text-ink">{report.post.text}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-brown-sec">
            <span>
              <strong className="text-brown">{t("reasonLabel")}</strong>{" "}
              <span className="rounded-full bg-live/10 px-2 py-0.5 font-medium text-live">
                {tReport(`reason_${report.reason}`)}
              </span>
            </span>
            <span>
              {t("reportedBy")}{" "}
              <strong className="text-brown">@{report.reportedBy.handle}</strong>
            </span>
            <span className="ml-auto">{report.reportedAt}</span>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
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
          </div>
        </li>
      ))}
    </ul>
  );
}
