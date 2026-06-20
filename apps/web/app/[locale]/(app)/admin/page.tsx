import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Shield } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser, getReportedPosts } from "@/lib/api";
import { ModerationQueue } from "@/components/admin/moderation-queue";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "app.admin" });
  return { title: `${t("title")} · WeTalk` };
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user.role || !["admin", "moderator"].includes(user.role)) {
    notFound();
  }

  const [reports, t] = await Promise.all([
    getReportedPosts(),
    getTranslations("app.admin"),
  ]);

  return (
    <main className="min-w-0 flex-1 lg:border-x lg:border-border">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-canvas/80 px-5 py-4 backdrop-blur-md">
        <Shield className="size-5 text-gold" />
        <h1 className="font-head text-xl font-extrabold text-brown">
          {t("title")}
        </h1>
        {reports.length > 0 && (
          <span className="ml-auto grid size-6 place-items-center rounded-full bg-live text-xs font-bold text-white">
            {reports.length}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-b border-border">
        {[
          { label: t("statReports"), value: reports.length },
          { label: t("statUsers"), value: "—" },
          { label: t("statPosts"), value: "—" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 border-r border-border px-4 py-5 last:border-0"
          >
            <span className="text-2xl font-extrabold text-brown">{value}</span>
            <span className="text-xs text-brown-sec">{label}</span>
          </div>
        ))}
      </div>

      {/* File de modération */}
      <section className="px-5 py-6">
        <h2 className="mb-4 font-head text-lg font-bold text-brown">
          {t("queueTitle")}
        </h2>
        <ModerationQueue initialReports={reports} />
      </section>
    </main>
  );
}
