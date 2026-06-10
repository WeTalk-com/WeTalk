"use client";

import Link from "next/link";
import { PhoneDemo } from "./phone-demo";
import { useCountUp, useReducedMotion } from "./hooks";
import { Compass, Heart, ImageIcon, PlayCircle } from "./icons";

const NAV_LINKS = ["Discover", "Creators", "Live", "About"];

const TITLE_WORDS = ["The", "warm", "side", "of", "social."];

const CREATORS = [
  "Maya",
  "Theo",
  "Nina",
  "Leo",
  "Elif",
  "Remy",
  "Jonas",
  "Iris",
  "Karl",
  "Sora",
];

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

/* Stat avec count-up */
function Stat({
  target,
  suffix,
  label,
  enabled,
}: {
  target: number;
  suffix: string;
  label: string;
  enabled: boolean;
}) {
  const value = useCountUp(target, 1600, enabled);
  return (
    <div>
      <div className="font-head text-3xl font-extrabold text-brown">
        {Math.round(value).toLocaleString("en-US")}
        {suffix}
      </div>
      <div className="text-sm text-brown-sec">{label}</div>
    </div>
  );
}

export function Landing() {
  const reduced = useReducedMotion();

  return (
    <div className="min-h-dvh bg-canvas font-body text-brown">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 h-[72px] border-b border-border bg-canvas/80 backdrop-blur">
        <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-5">
          <span className="font-head text-[28px] font-extrabold italic text-brown">
            WeeTalk
          </span>
          <ul className="hidden items-center gap-8 text-sm font-medium text-brown-sec md:flex">
            {NAV_LINKS.map((l) => (
              <li key={l}>
                <a href="#" className="transition-colors hover:text-gold">
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-brown transition-colors hover:text-gold"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-105 active:scale-[0.98]"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
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
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium text-brown-sec">
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
              <Link
                href="/login"
                className="flex h-14 items-center gap-2 rounded-full bg-gold px-7 font-bold text-white shadow-[0_8px_20px_rgba(186,117,23,0.32)] transition-all hover:brightness-105 active:scale-[0.98]"
              >
                Create your account →
              </Link>
              <button
                type="button"
                className="flex h-14 items-center gap-2 rounded-full border border-border bg-white px-5 font-semibold text-brown transition-colors hover:bg-cream"
              >
                <span className="grid size-8 place-items-center rounded-full bg-gold/15 text-gold">
                  <PlayCircle className="size-5" />
                </span>
                Watch the film
              </button>
            </div>

            {/* STATS */}
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
              <Stat
                target={120}
                suffix="k+"
                label="creators"
                enabled={!reduced}
              />
              <Stat
                target={4}
                suffix="M"
                label="golden hours"
                enabled={!reduced}
              />
              <Stat
                target={98}
                suffix="%"
                label="come back daily"
                enabled={!reduced}
              />
            </div>
          </div>

          {/* DROITE : le film */}
          <div className="flex justify-center lg:justify-end">
            <PhoneDemo />
          </div>
        </div>
      </section>

      {/* BANDEAU CREATEURS */}
      <section className="border-y border-border bg-cream py-12">
        <p className="text-center text-xs font-semibold uppercase tracking-[2px] text-brown-sec">
          Loved by warm-light people everywhere
        </p>
        <div
          className="mt-6 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)",
          }}
        >
          <div className="animate-marquee flex w-max gap-3">
            {[...CREATORS, ...CREATORS].map((name, i) => (
              <span
                key={i}
                className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-brown"
              >
                <span className="grid size-7 place-items-center rounded-full bg-gold/20 text-xs font-semibold text-gold">
                  {name[0]}
                </span>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <article
              key={title}
              className="rounded-[18px] border border-border bg-white p-6 transition-transform duration-200 hover:-translate-y-1"
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
          <Link
            href="/login"
            className="flex h-14 items-center gap-2 rounded-full bg-gold px-8 font-bold text-white shadow-[0_8px_20px_rgba(186,117,23,0.32)] transition-all hover:brightness-105 active:scale-[0.98]"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
