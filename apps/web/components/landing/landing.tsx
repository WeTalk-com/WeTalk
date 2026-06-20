import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { CreatorsMarquee } from "./creators-marquee";
import { Features } from "./features";

/**
 * Landing publique. Server Component : seuls le hero (stats animees)
 * et la demo telephone sont des Client Components.
 */
export function Landing() {
  return (
    <div className="min-h-dvh bg-canvas font-body text-brown">
      <Navbar />
      <Hero />
      <CreatorsMarquee />
      <Features />
    </div>
  );
}
