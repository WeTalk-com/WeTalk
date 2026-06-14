import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "../ui/avatar";
import type { Notification, NotificationType } from "@/lib/mock-data";

const TYPE: Record<NotificationType, { Icon: LucideIcon; badge: string }> = {
  like: { Icon: Heart, badge: "bg-live" },
  comment: { Icon: MessageCircle, badge: "bg-blue" },
  follow: { Icon: UserPlus, badge: "bg-gold" },
  mention: { Icon: AtSign, badge: "bg-gold-dark" },
};

export function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const { actor, type, text, preview, timeAgo, read } = notification;
  const { Icon, badge } = TYPE[type];

  return (
    <li
      className={`flex gap-3 border-b border-border px-5 py-4 transition-colors hover:bg-cream ${
        read ? "" : "bg-gold/5"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar initial={actor.initial} />
        <span
          className={`absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full text-white ring-2 ring-canvas ${badge}`}
        >
          <Icon className="size-3" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-brown">
          <span className="font-semibold">{actor.name}</span> {text}
        </p>
        {preview && (
          <p className="mt-1 truncate text-sm text-brown-sec">{preview}</p>
        )}
        <p className="mt-1 text-xs text-brown-sec">{timeAgo}</p>
      </div>

      {!read && (
        <span className="mt-2 size-2 shrink-0 rounded-full bg-gold" aria-hidden />
      )}
    </li>
  );
}
