import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { PhoneDemo } from "./phone-demo";
import { HeroStats } from "./hero-stats";

export function Hero() {
  const t = useTranslations("landing.hero");
  const titleWords = t("title").split(" ");
  const highlight = t("highlightWord");

  return (
    <section className="relative flex-1 overflow-hidden">
      {/* Halos ambiants qui derivent */}
      <div
        aria-hidden
        className="animate-drift1 pointer-events-none absolute -left-20 top-0 size-130 rounded-full bg-[radial-gradient(circle,rgba(239,159,39,0.18),transparent_60%)]"
      />
      <div
        aria-hidden
        className="animate-drift2 pointer-events-none absolute -right-24 top-40 size-140 rounded-full bg-[radial-gradient(circle,rgba(186,117,23,0.14),transparent_62%)]"
      />

      <div className="relative mx-auto grid h-full max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        {/* GAUCHE */}
        <div>
          {/* Titre */}
          <h1 className="font-head text-[44px] font-extrabold leading-[1.02] tracking-tight text-brown sm:text-[62px]">
            {titleWords.map((word, i) => (
              <Fragment key={i}>
                <span
                  className="word-in"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  {word === highlight ? (
                    <em className="shimmer-text italic">{word}</em>
                  ) : (
                    word
                  )}
                </span>{" "}
              </Fragment>
            ))}
          </h1>

          {/* Paragraphe */}
          <p className="mt-5 max-w-xl text-lg text-brown-sec">{t("paragraph")}</p>

          {/* CTA */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button href="/login" size="lg">
              {t("ctaCreate")}
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
