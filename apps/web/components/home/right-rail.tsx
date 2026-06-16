import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { UserChip } from "../ui/user-chip";
import { whoToFollow, trending } from "@/lib/mock-data";

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

const FOOTER_LINKS = ["About", "Help", "Terms", "Privacy"];

export function RightRail() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[340px] shrink-0 flex-col gap-5 px-4 py-6 lg:flex">
      {/* Who to follow */}
      <Section title="Who to follow">
        <ul className="flex flex-col gap-4">
          {whoToFollow.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <UserChip user={u} className="min-w-0 flex-1" />
              <Button size="sm">Follow</Button>
            </li>
          ))}
        </ul>
      </Section>

      {/* Trending */}
      <Section title="Trending">
        <ul className="flex flex-col gap-4">
          {trending.map((t) => (
            <li key={t.tag}>
              <p className="text-sm text-brown-sec">{t.category}</p>
              <p className="font-semibold text-gold">{t.tag}</p>
              <p className="text-sm text-brown-sec">{t.posts}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Footer */}
      <footer className="px-2 text-sm text-brown-sec">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {FOOTER_LINKS.map((l, i) => (
            <span key={l} className="flex items-center gap-2">
              <a href="#" className="transition-colors hover:text-brown">
                {l}
              </a>
              {i < FOOTER_LINKS.length - 1 && <span>·</span>}
            </span>
          ))}
        </p>
        <p className="mt-2">© 2026 WeeTalk</p>
      </footer>
    </aside>
  );
}
