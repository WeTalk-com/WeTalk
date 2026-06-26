import { Navbar } from "./navbar";
import { Hero } from "./hero";

export function Landing() {
  return (
    <div className="h-dvh overflow-hidden bg-canvas font-body text-brown flex flex-col">
      <Navbar />
      <Hero />
    </div>
  );
}
