import { Button } from "../ui/button";
import { Compass, Heart, ImageIcon } from "./icons";

const FEATURES = [
  {
    Icon: ImageIcon,
    title: "Made for visual stories",
    text: "Full-bleed photo posts with warm-tone presets built in.",
  },
  {
    Icon: Compass,
    title: "A calmer discovery",
    text: "No doomscroll. Curated by people, sorted by warmth.",
  },
  {
    Icon: Heart,
    title: "Real connection",
    text: "Follow fewer, talk more. Comments that feel like a coffee.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="grid gap-5 md:grid-cols-3">
        {FEATURES.map(({ Icon, title, text }) => (
          <article
            key={title}
            className="rounded-[18px] border border-border bg-card p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <span className="grid size-12 place-items-center rounded-xl bg-gold/10 text-gold">
              <Icon className="size-6" />
            </span>
            <h3 className="mt-4 font-head text-xl font-bold text-brown">
              {title}
            </h3>
            <p className="mt-2 text-brown-sec">{text}</p>
          </article>
        ))}
      </div>

      {/* CTA final */}
      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <h2 className="font-head text-3xl font-extrabold text-brown sm:text-4xl">
          Come for the light. Stay for the people.
        </h2>
        <Button href="/login" size="lg">
          Get started
        </Button>
      </div>
    </section>
  );
}
