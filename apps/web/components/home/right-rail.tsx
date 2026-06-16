import { useTranslations } from "next-intl";
import type { User, TrendingTopic } from "@/lib/types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { UserChip } from "../ui/user-chip";

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

export function RightRail({
  users,
  topics,
}: {
  users: User[];
  topics: TrendingTopic[];
}) {
  const t = useTranslations("app.rightRail");
  const footerLinks = [
    t("linkAbout"),
    t("linkHelp"),
    t("linkTerms"),
    t("linkPrivacy"),
  ];

  return (
    <aside className="sticky top-0 hidden h-dvh w-[340px] shrink-0 flex-col gap-5 px-4 py-6 lg:flex">
      {/* Who to follow */}
      <Section title={t("whoToFollow")}>
        <ul className="flex flex-col gap-4">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <UserChip user={u} className="min-w-0 flex-1" />
              <Button size="sm">{t("follow")}</Button>
            </li>
          ))}
        </ul>
      </Section>

      {/* Trending */}
      <Section title={t("trending")}>
        <ul className="flex flex-col gap-4">
          {topics.map((topic) => (
            <li key={topic.tag}>
              <p className="text-sm text-brown-sec">{topic.category}</p>
              <p className="font-semibold text-gold">{topic.tag}</p>
              <p className="text-sm text-brown-sec">{topic.posts}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Footer */}
      <footer className="px-2 text-sm text-brown-sec">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {footerLinks.map((l, i) => (
            <span key={l} className="flex items-center gap-2">
              <a href="#" className="transition-colors hover:text-brown">
                {l}
              </a>
              {i < footerLinks.length - 1 && <span>·</span>}
            </span>
          ))}
        </p>
        <p className="mt-2">{t("copyright")}</p>
      </footer>
    </aside>
  );
}
