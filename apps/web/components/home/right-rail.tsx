import { useTranslations } from "next-intl";
import type { TrendingTopic } from "@/lib/types";
import { Link } from "@/i18n/navigation";
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
    { label: t("linkAbout"), href: "/about" as const },
    { label: t("linkHelp"), href: "/help" as const },
    { label: t("linkTerms"), href: "/terms" as const },
    { label: t("linkPrivacy"), href: "/privacy" as const },
  ];

  return (
    <aside className="sticky top-0 hidden h-dvh w-[340px] shrink-0 flex-col gap-5 px-4 py-6 xl:flex">
      {/* Trending */}
      <Section title={t("trending")}>
        <ul className="flex flex-col gap-4">
          {topics.map((topic) => (
            <li key={topic.tag}>
              <Link
                href={{ pathname: "/explore", query: { tag: topic.tag } }}
                className="block rounded-lg -mx-2 px-2 py-1 transition-colors hover:bg-card"
              >
                <p className="font-semibold text-gold">#{topic.tag}</p>
                <p className="text-sm text-brown-sec">{t("postCount", { count: topic.count })}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Footer */}
      <footer className="mt-auto px-2 text-xs text-brown-sec">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {footerLinks.map((l, i) => (
            <span key={l.href} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
              <Link href={l.href} className="transition-colors hover:text-brown">
                {l.label}
              </Link>
              {i < footerLinks.length - 1 && <span aria-hidden>·</span>}
            </span>
          ))}
        </p>
        <p className="mt-2">{t("copyright")}</p>
      </footer>
    </aside>
  );
}
