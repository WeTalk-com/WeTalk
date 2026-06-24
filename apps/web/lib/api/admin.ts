import type { ReportedPost } from "@/lib/types";
import { reportedPosts } from "@/lib/mock-data";

/** Liste des posts signalés en attente de modération. */
export async function getReportedPosts(): Promise<ReportedPost[]> {
  // TODO(api): return apiFetch<ReportedPost[]>("/admin/reports?status=pending");
  return structuredClone(reportedPosts.filter((r) => r.status === "pending"));
}

/** Ignore un signalement (le post reste visible). */
export async function dismissReport(_reportId: string): Promise<void> {
  // TODO(api): await apiFetch(`/admin/reports/${_reportId}/dismiss`, { method: "POST" });
}

/** Supprime le post signalé et résout le rapport. */
export async function removeReportedPost(_reportId: string): Promise<void> {
  // TODO(api): await apiFetch(`/admin/reports/${_reportId}/remove`, { method: "POST" });
}
