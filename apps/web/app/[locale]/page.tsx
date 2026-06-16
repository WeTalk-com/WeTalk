import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/** La racine redirige vers la page d'accueil publique /welcome. */
export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/welcome", locale: locale as Locale });
}
