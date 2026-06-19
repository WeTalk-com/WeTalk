import type { ReportedPost } from "@/lib/types";
import { reportedPosts } from "@/lib/mock-data";

/** Liste des posts signalés en attente de modération. */
export async function getReportedPosts(): Promise<ReportedPost[]> {
  // TODO(api): return apiFetch<ReportedPost[]>("/admin/reports?status=pending");
  return structuredClone(reportedPosts.filter((r) => r.status === "pending"));
}

/** Ignore un signalement (le post reste visible). */
export async function dismissReport(reportId: string): Promise<void> {
  // TODO(api): await apiFetch(`/admin/reports/${reportId}/dismiss`, { method: "POST" });
  if (process.env.NODE_ENV === "development") {
    console.log("dismissReport (mock)", reportId);
  }
}

/** Supprime le post signalé et résout le rapport. */
export async function removeReportedPost(reportId: string): Promise<void> {
  // TODO(api): await apiFetch(`/admin/reports/${reportId}/remove`, { method: "POST" });
  if (process.env.NODE_ENV === "development") {
    console.log("removeReportedPost (mock)", reportId);
  }
}
