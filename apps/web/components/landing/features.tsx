import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { Compass, Heart, ImageIcon } from "../icons/demo";

export function Features() {
  const t = useTranslations("landing.features");
  const features = [
    { Icon: ImageIcon, title: t("visualTitle"), text: t("visualText") },
    { Icon: Compass, title: t("discoveryTitle"), text: t("discoveryText") },
    { Icon: Heart, title: t("connectionTitle"), text: t("connectionText") },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="grid gap-5 md:grid-cols-3">
        {features.map(({ Icon, title, text }) => (
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
          {t("ctaHeading")}
        </h2>
        <Button href="/login" size="lg">
          {t("getStarted")}
        </Button>
      </div>
    </section>
  );
}
