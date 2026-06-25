import type { ReportedPost, ReportReason, User } from "@/lib/types";
import { apiFetch } from "./client";

export type SuspendUnit = "minutes" | "hours" | "days" | "months" | "years";

type BackendReportUser = {
  id: string;
  username: string;
  displayName?: string | null;
  profileImage?: string | null;
  isBanned?: boolean;
  isSuspended?: boolean;
};

type BackendReport = {
  id: string;
  reason: ReportReason;
  details?: string | null;
  status: "pending" | "resolved" | "dismissed";
  reportedAt: string;
  reporter: BackendReportUser | null;
  post: {
    _id: string;
    content: string;
    createdAt: string;
    author: BackendReportUser | null;
  } | null;
};

function mapReportUser(u: BackendReportUser | null): User | null {
  if (!u) return null;
  const name = u.displayName ?? u.username;
  return {
    id: u.id,
    name,
    handle: u.username,
    initial: name[0]?.toUpperCase() ?? "?",
    avatarUrl: u.profileImage ?? undefined,
    isBanned: u.isBanned,
    isSuspended: u.isSuspended,
  };
}

function mapReport(r: BackendReport): ReportedPost {
  return {
    id: r.id,
    reason: r.reason,
    details: r.details,
    status: r.status,
    reportedAt: r.reportedAt,
    reporter: mapReportUser(r.reporter),
    post: r.post
      ? {
          id: r.post._id,
          text: r.post.content,
          author: mapReportUser(r.post.author),
        }
      : null,
  };
}

/** Nombre total de posts sur la plateforme. */
export async function getTotalPostCount(): Promise<number> {
  const data = await apiFetch<{ count: number }>("/posts/count");
  return data.count ?? 0;
}

/** File de modération : posts signalés en attente. */
export async function getReportedPosts(): Promise<ReportedPost[]> {
  const data = await apiFetch<{ reports: BackendReport[] }>("/admin/reports?status=pending");
  return (data.reports ?? []).map(mapReport);
}

/** Ignorer un signalement (le post reste visible). */
export async function dismissReport(reportId: string): Promise<void> {
  await apiFetch(`/admin/reports/${encodeURIComponent(reportId)}/dismiss`, { method: "POST" });
}

/** Supprimer le post signalé et résoudre le rapport. */
export async function removeReportedPost(reportId: string): Promise<void> {
  await apiFetch(`/admin/reports/${encodeURIComponent(reportId)}/remove`, { method: "POST" });
}

/** Bannir un utilisateur (mod/admin uniquement). */
export async function banUser(userId: string): Promise<void> {
  await apiFetch(`/users/${encodeURIComponent(userId)}/ban`, { method: "POST" });
}

/** Lever le bannissement d'un utilisateur. */
export async function unbanUser(userId: string): Promise<void> {
  await apiFetch(`/users/${encodeURIComponent(userId)}/ban`, { method: "DELETE" });
}

/** Suspendre un utilisateur pour une durée donnée. */
export async function suspendUser(userId: string, amount: number, unit: SuspendUnit): Promise<void> {
  await apiFetch(`/users/${encodeURIComponent(userId)}/suspend`, {
    method: "POST",
    body: JSON.stringify({ amount, unit }),
  });
}

/** Lever la suspension d'un utilisateur. */
export async function unsuspendUser(userId: string): Promise<void> {
  await apiFetch(`/users/${encodeURIComponent(userId)}/suspend`, { method: "DELETE" });
}
