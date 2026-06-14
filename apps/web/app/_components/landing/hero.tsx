import { Button } from "../ui/button";
import { PlayCircle } from "./icons";
import { PhoneDemo } from "./phone-demo";
import { HeroStats } from "./hero-stats";

const TITLE_WORDS = ["The", "warm", "side", "of", "social."];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Halos ambiants qui derivent */}
      <div
        aria-hidden
        className="animate-drift1 pointer-events-none absolute -left-20 top-0 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(239,159,39,0.18),transparent_60%)]"
      />
      <div
        aria-hidden
        className="animate-drift2 pointer-events-none absolute -right-24 top-40 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(186,117,23,0.14),transparent_62%)]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        {/* GAUCHE */}
        <div>
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-brown-sec">
            <span className="animate-pulse-dot size-2 rounded-full bg-live" />
            Now live · invite-only beta
          </span>

          {/* Titre */}
          <h1 className="mt-5 font-head text-[44px] font-extrabold leading-[1.02] tracking-tight text-brown sm:text-[62px]">
            {TITLE_WORDS.map((word, i) => (
              <span
                key={i}
                className="word-in"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {word === "warm" ? (
                  <em className="shimmer-text italic">warm</em>
                ) : (
                  word
                )}{" "}
              </span>
            ))}
          </h1>

          {/* Paragraphe */}
          <p className="mt-5 max-w-xl text-lg text-brown-sec">
            Share your golden hours, follow people you actually like, and talk
            slower. WeeTalk is the feed that feels good to come back to.
          </p>

          {/* CTA */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button href="/login" size="lg">
              Create your account →
            </Button>
            <Button variant="outline" size="lg">
              <span className="grid size-8 place-items-center rounded-full bg-gold/15 text-gold">
                <PlayCircle className="size-5" />
              </span>
              Watch the film
            </Button>
          </div>

          {/* STATS (client) */}
          <HeroStats />
        </div>

        {/* DROITE : le film (client) */}
        <div className="flex justify-center lg:justify-end">
          <PhoneDemo />
        </div>
      </div>
    </section>
  );
}
