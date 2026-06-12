import { Button } from "./_components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-6 text-center">
      <div>
        <p className="font-head text-7xl font-extrabold italic text-gold">404</p>
        <h1 className="mt-4 font-head text-3xl font-extrabold text-brown">
          This page wandered off.
        </h1>
        <p className="mt-2 text-brown-sec">
          The warm corner you’re looking for doesn’t exist (yet).
        </p>
        <Button href="/" size="lg" className="mt-6">
          Back home
        </Button>
      </div>
    </main>
  );
}
