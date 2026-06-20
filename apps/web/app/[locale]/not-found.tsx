import { useTranslations } from "next-intl";
import { ErrorScreen } from "@/components/error-screen/error-screen";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("errors");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-canvas px-6 py-12 text-center">
      <ErrorScreen code="404" label={t("notFoundLabel")} />
      <p className="text-brown-sec">{t("notFoundMessage")}</p>
      <Button href="/" size="lg">
        {t("notFoundCta")}
      </Button>
    </main>
  );
}
