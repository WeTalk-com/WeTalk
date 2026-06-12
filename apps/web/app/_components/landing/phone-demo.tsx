"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  Comment,
  Send,
  Search,
  ImageIcon,
  Smile,
  MapPin,
  Sparkle,
  X,
} from "./icons";
import { VerifiedBadge } from "../icons";
import { useReducedMotion } from "./hooks";

const SCENES = ["Home feed", "Explore", "Create"] as const;
const SCENE_MS = 3600;

/* ---------------- Scene 1 : Home feed (auto-like) ---------------- */

function HomeScene({ active }: { active: boolean }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!active) {
      setLiked(false);
      return;
    }
    const t = setTimeout(() => setLiked(true), 1300);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-head text-lg font-extrabold italic text-brown">
          WeeTalk
        </span>
        <Bell className="size-4 text-brown-sec" />
      </div>

      {/* Post */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-gold/20 text-sm font-semibold text-gold">
            M
          </span>
          <div className="leading-tight">
            <span className="flex items-center gap-1 text-sm font-semibold text-brown">
              Maya Rivera <VerifiedBadge className="size-3.5" />
            </span>
            <span className="text-xs text-brown-sec">@maya · 2h</span>
          </div>
        </div>

        {/* Image placeholder rayee */}
        <div className="mt-3 aspect-4/5 w-full rounded-xl bg-gold/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(186,117,23,0.10)_12px,rgba(186,117,23,0.10)_24px)]" />

        {/* Like row */}
        <div className="mt-3 flex items-center gap-4 text-brown-sec">
          <span className="relative inline-flex">
            <Heart
              className={`size-5 transition-colors ${
                liked ? "like-pop fill-live text-live" : ""
              }`}
            />
            {/* Etincelles dorees au like */}
            {liked && (
              <span aria-hidden className="pointer-events-none absolute inset-0">
                {[
                  { x: "-14px", y: "-12px" },
                  { x: "14px", y: "-10px" },
                  { x: "-10px", y: "10px" },
                  { x: "12px", y: "12px" },
                ].map((s, i) => (
                  <span
                    key={i}
                    className="spark absolute left-1/2 top-1/2 size-1.5 rounded-full bg-gold-bright"
                    style={
                      {
                        "--sx": s.x,
                        "--sy": s.y,
                        animationDelay: `${i * 40}ms`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </span>
            )}
          </span>
          <Comment className="size-5" />
          <Send className="size-5" />
          <span className="ml-auto text-xs font-medium text-brown">
            {(liked ? 1246 : 1245).toLocaleString("en-US")} likes
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Scene 2 : Explore (tiles en cascade) ---------------- */

function ExploreScene({ active }: { active: boolean }) {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (active) setCycle((c) => c + 1);
  }, [active]);

  const chips = ["All", "Photo", "Travel"];

  return (
    <div className="flex h-full flex-col px-4 py-3">
      {/* Recherche */}
      <div className="flex items-center gap-2 rounded-full bg-cream px-3 py-2 text-brown-sec">
        <Search className="size-4" />
        <span className="text-sm">golden hour</span>
      </div>

      {/* Chips */}
      <div className="mt-3 flex gap-2">
        {chips.map((c, i) => (
          <span
            key={c}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              i === 0
                ? "bg-gold text-white"
                : "bg-cream text-brown-sec"
            }`}
          >
            {c}
          </span>
        ))}
      </div>

      {/* Grille 2 colonnes */}
      <div key={cycle} className="mt-3 grid flex-1 grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="tile-in rounded-lg bg-gold/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(186,117,23,0.10)_10px,rgba(186,117,23,0.10)_20px)]"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Scene 3 : Create (machine a ecrire) ---------------- */

const CAPTION = "Golden hour never misses ☀️ #weetalk";

function CreateScene({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) {
  const [n, setN] = useState(reduced ? CAPTION.length : 0);

  useEffect(() => {
    if (!active) {
      setN(reduced ? CAPTION.length : 0);
      return;
    }
    if (reduced) {
      setN(CAPTION.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= CAPTION.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [active, reduced]);

  return (
    <div className="flex h-full flex-col px-4 py-3">
      {/* Header modale */}
      <div className="flex items-center justify-between">
        <span className="font-head text-base font-extrabold text-brown">
          New post
        </span>
        <X className="size-4 text-brown-sec" />
      </div>

      {/* Caption */}
      <div className="mt-3 min-h-12 rounded-xl bg-cream px-3 py-2 text-sm text-brown">
        {CAPTION.slice(0, n)}
        <span className="caret ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-gold" />
      </div>

      {/* Image placeholder */}
      <div className="mt-3 aspect-4/3 w-full rounded-xl bg-gold/10 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(186,117,23,0.10)_12px,rgba(186,117,23,0.10)_24px)]" />

      {/* Barre d'actions */}
      <div className="mt-3 flex items-center gap-4 text-brown-sec">
        <ImageIcon className="size-5" />
        <Smile className="size-5" />
        <MapPin className="size-5" />
        <Sparkle className="size-5" />
        <span className="ml-auto rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-white">
          Post
        </span>
      </div>
    </div>
  );
}

/* ---------------- Cadre telephone + orchestration ---------------- */

export function PhoneDemo() {
  const reduced = useReducedMotion();
  const [scene, setScene] = useState(0);

  useEffect(() => {
    if (reduced) {
      setScene(0);
      return;
    }
    const id = setInterval(
      () => setScene((s) => (s + 1) % SCENES.length),
      SCENE_MS,
    );
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className="relative mx-auto w-fit">
      {/* Halo dore flou */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(239,159,39,0.30),transparent_65%)] blur-2xl"
      />

      {/* Cadre */}
      <div className="animate-bob relative h-[540px] w-[332px] rounded-[34px] border-[7px] border-dark bg-card shadow-[0_30px_70px_rgba(65,36,2,0.28)]">
        <div className="relative h-full w-full overflow-hidden rounded-[27px] bg-card">
          {/* Scenes empilees (crossfade + scale) */}
          {[
            <HomeScene key="h" active={scene === 0} />,
            <ExploreScene key="e" active={scene === 1} />,
            <CreateScene key="c" active={scene === 2} reduced={reduced} />,
          ].map((node, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-700 ${
                scene === i
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0"
              }`}
            >
              {node}
            </div>
          ))}
        </div>

        {/* Pill REC + progression */}
        <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-dark px-3.5 py-2 text-white shadow-lg">
          <span className="animate-pulse-dot size-2 rounded-full bg-live" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Rec
          </span>
          <span className="text-xs text-white/70">{SCENES[scene]}</span>
          <span className="ml-1 flex items-center gap-1">
            {SCENES.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  scene === i ? "w-4 bg-gold-bright" : "w-1 bg-white/30"
                }`}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
