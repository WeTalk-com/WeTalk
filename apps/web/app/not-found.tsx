import { ErrorScreen } from "./_components/ui/error-screen";
import { Button } from "./_components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-canvas px-6 py-12 text-center">
      <ErrorScreen code="404" label="NOT FOUND" />
      <p className="text-brown-sec">
        The warm corner you’re looking for doesn’t exist (yet).
      </p>
      <Button href="/" size="lg">
        Back home
      </Button>
    </main>
  );
}
