"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorScreen } from "@/components/error-screen/error-screen";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    // Hook de logging (sera branche sur un service plus tard)
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-canvas px-6 py-12 text-center">
      <ErrorScreen code="500" label={t("serverErrorLabel")} />
      <p className="text-brown-sec">{t("serverErrorMessage")}</p>
      <Button onClick={reset} size="lg">
        {t("serverErrorCta")}
      </Button>
    </main>
  );
}
