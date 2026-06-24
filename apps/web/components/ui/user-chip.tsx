import { Avatar } from "./avatar";
import { VerifiedBadge } from "../icons/brand";
import { cn } from "@/lib/cn";

type ChipUser = {
  name: string;
  handle: string;
  initial: string;
  avatarUrl?: string;
  verified?: boolean;
};

/** Avatar + nom (+ badge verifie) + ligne secondaire (@handle par defaut). */
export function UserChip({
  user,
  subtitle,
  solid = false,
  className = "",
}: {
  user: ChipUser;
  subtitle?: string;
  solid?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar initial={user.initial} src={user.avatarUrl} solid={solid} alt={user.name} />
      <div className="min-w-0 leading-tight">
        <div className="flex items-center gap-1 font-semibold text-brown">
          <span className="truncate">{user.name}</span>
          {user.verified && <VerifiedBadge className="size-4.5 shrink-0" />}
        </div>
        <p className="truncate text-sm text-brown-sec">
          {subtitle ?? `@${user.handle}`}
        </p>
      </div>
    </div>
  );
}
