import type { Metadata } from "next";
import Link from "next/link";
import { Tag, Lock, ChevronsRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Welcome · WeTalk",
};

export default function WelcomePage() {
  return (
    <main className="min-h-dvh bg-gold-dark flex justify-center">
      {/* Cadre mobile-first : la maquette est pensee pour le mobile */}
      <div className="relative w-full max-w-md min-h-dvh px-7 pt-8 pb-8 flex flex-col">
        {/* Icone tag en haut a droite */}
        <button
          type="button"
          aria-label="Categories"
          className="self-end grid place-items-center size-12 rounded-full border border-white/40 text-white/90"
        >
          <Tag className="size-5" />
        </button>

        {/* Titre */}
        <h1 className="mt-6 font-display text-white text-5xl leading-[1.05] font-bold">
          Join <em className="italic font-semibold">WeeTalk</em> Network for
          Amplify in your life.
        </h1>

        {/* Zone image (person cutout) - placeholder design */}
        <div className="mt-8 flex-1 min-h-64 rounded-[2.5rem] bg-white/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.06)_10px,rgba(255,255,255,0.06)_20px)] grid place-items-end justify-center pb-10">
          <span className="text-white/50 text-xs font-mono text-center leading-relaxed">
            person
            <br />
            cutout.png
          </span>
        </div>

        {/* CTA */}
        <Link
          href="/feed"
          className="mt-6 flex items-center justify-between gap-3 rounded-full bg-dock px-6 py-5 text-white"
        >
          <Lock className="size-5 shrink-0" />
          <span className="flex-1 text-center text-lg font-semibold">
            Lets Started
          </span>
          <ChevronsRight className="size-5 shrink-0 text-gold" />
        </Link>
      </div>
    </main>
  );
}
