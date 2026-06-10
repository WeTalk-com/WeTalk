import { Avatar } from "./avatar";
import { liveNow, whoToFollow, trending } from "../../lib/mock-data";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card border border-line p-5">
      <h2 className="font-display text-xl font-bold mb-4">{title}</h2>
      {children}
    </section>
  );
}

export function RightSidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-5 w-80 shrink-0">
      {/* Live now */}
      <Card title="Live now">
        <ul className="flex flex-col gap-4">
          {liveNow.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <Avatar initial={u.initial} ring />
              <div className="min-w-0">
                <p className="font-semibold text-ink truncate">{u.name}</p>
                <p className="text-sm text-ink-soft">{u.watching} watching</p>
              </div>
              <span className="ml-auto rounded bg-live px-2 py-0.5 text-xs font-bold text-white">
                LIVE
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Who to follow */}
      <Card title="Who to follow">
        <ul className="flex flex-col gap-4">
          {whoToFollow.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <Avatar initial={u.initial} />
              <div className="min-w-0">
                <p className="font-semibold text-ink truncate">{u.name}</p>
                <p className="text-sm text-ink-soft">@{u.handle}</p>
              </div>
              <button
                type="button"
                className="ml-auto rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-white hover:bg-gold-dark transition-colors"
              >
                Follow
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {/* Trending */}
      <Card title="Trending">
        <ul className="flex flex-col gap-4">
          {trending.map((t) => (
            <li key={t.tag}>
              <p className="text-sm text-ink-soft">{t.category}</p>
              <p className="font-semibold text-gold">{t.tag}</p>
              <p className="text-sm text-ink-soft">{t.posts}</p>
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  );
}
