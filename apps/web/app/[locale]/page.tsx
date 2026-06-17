import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/** La racine redirige vers la page d'accueil publique /welcome. */
export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }
  redirect({ href: "/welcome", locale: locale as Locale });
}
