"use client";

import { Avatar } from "./avatar";

type UserSuggestion = {
  id: string;
  username: string;
  displayName: string | null;
  profileImage: string | null;
};

export function MentionDropdown({
  users,
  loading,
  mention,
  onSelect,
}: {
  users: UserSuggestion[];
  loading: boolean;
  mention: { start: number; query: string } | null;
  onSelect: (username: string) => void;
}) {
  if (!mention || mention.query.length < 1 || users.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-card">
      {loading && users.length === 0 && (
        <div className="px-4 py-2 text-sm text-brown-sec">Searching...</div>
      )}
      {users.map((u) => {
        const name = u.displayName?.trim() || u.username;
        return (
          <button
            key={u.id}
            type="button"
            onClick={() => onSelect(u.username)}
            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-canvas"
          >
            <Avatar
              initial={name.charAt(0).toUpperCase()}
              src={u.profileImage ?? undefined}
              size={28}
            />
            <div className="min-w-0">
              <span className="font-medium text-brown">{name}</span>
              <span className="ml-1.5 text-brown-sec">@{u.username}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
