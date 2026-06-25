import { useTranslations } from "next-intl";
import type { TrendingTopic } from "@/lib/types";
import { Card } from "../ui/card";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card as="section" className="p-5">
      <h2 className="mb-4 font-display text-xl font-bold text-brown">{title}</h2>
      {children}
    </Card>
  );
}

export function RightRail({ topics }: { topics: TrendingTopic[] }) {
  const t = useTranslations("app.rightRail");
  const footerLinks = [
    t("linkAbout"),
    t("linkHelp"),
    t("linkTerms"),
    t("linkPrivacy"),
  ];

  return (
    <aside className="sticky top-0 hidden h-dvh w-[340px] shrink-0 flex-col gap-5 px-4 py-6 lg:flex">
      {/* Trending */}
      <Section title={t("trending")}>
        <ul className="flex flex-col gap-4">
          {topics.map((topic) => (
            <li key={topic.tag}>
              <p className="font-semibold text-gold">#{topic.tag}</p>
              <p className="text-sm text-brown-sec">{t("postCount", { count: topic.count })}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Footer */}
      <footer className="mt-auto px-2 text-xs text-brown-sec">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {footerLinks.map((l, i) => (
            <span key={l} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
              <a href="#" className="transition-colors hover:text-brown">
                {l}
              </a>
              {i < footerLinks.length - 1 && <span aria-hidden>·</span>}
            </span>
          ))}
        </p>
        <p className="mt-2">{t("copyright")}</p>
      </footer>
    </aside>
  );
}
