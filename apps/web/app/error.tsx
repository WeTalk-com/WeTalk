"use client";

import { useEffect } from "react";
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
    <main className="grid min-h-dvh place-items-center bg-canvas px-6 text-center">
      <div>
        <h1 className="font-head text-3xl font-extrabold text-brown">
          Something went sideways.
        </h1>
        <p className="mt-2 text-brown-sec">
          An unexpected error occurred. Try again in a moment.
        </p>
        <Button onClick={reset} size="lg" className="mt-6">
          Try again
        </Button>
      </div>
    </main>
  );
}
