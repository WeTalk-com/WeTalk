"use client";

import { useEffect } from "react";
import { ErrorScreen } from "./_components/ui/error-screen";
import { Button } from "./_components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook de logging (sera branche sur un service plus tard)
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-canvas px-6 py-12 text-center">
      <ErrorScreen code="500" label="ERROR" />
      <p className="text-brown-sec">
        An unexpected error occurred. Try again in a moment.
      </p>
      <Button onClick={reset} size="lg">
        Try again
      </Button>
    </main>
  );
}
