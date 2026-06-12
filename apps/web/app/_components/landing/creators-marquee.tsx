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

const FADE_MASK =
  "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)";

export function CreatorsMarquee() {
  return (
    <section className="border-y border-border bg-cream py-12">
      <p className="text-center text-xs font-semibold uppercase tracking-[2px] text-brown-sec">
        Loved by warm-light people everywhere
      </p>
      <div
        className="mt-6 overflow-hidden"
        style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
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
  );
}
