import { getTranslations } from "next-intl/server";

export default async function UserProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  // TODO(api): fetch user by handle and render their profile
  const { handle } = await params;
  const t = await getTranslations("app.profile");

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <p className="text-brown-sec">{t("handleComingSoon", { handle })}</p>
    </main>
  );
}
