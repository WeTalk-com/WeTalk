"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { getFollowers, getFollowingList } from "@/lib/api";
import type { User } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";

type Props = {
  userId: string;
  type: "followers" | "following";
  title: string;
  isOpen: boolean;
  onClose: () => void;
};

export function FollowListModal({ userId, type, title, isOpen, onClose }: Props) {
  const t = useTranslations("app.profile");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setUsers([]);
    (type === "followers" ? getFollowers(userId) : getFollowingList(userId))
      .then((data) => { if (!cancelled) setUsers(data); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, userId, type]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-full max-w-sm rounded-2xl bg-canvas shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Dialog.Title className="font-display text-lg font-bold text-brown">
                {title}
              </Dialog.Title>
              <Dialog.Close
                aria-label={t("followListClose")}
                className="rounded-full p-1 text-brown-sec"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>

            <div className="max-h-96 overflow-y-auto py-2">
              {loading ? (
                <p className="py-8 text-center text-sm text-brown-sec">{t("followListLoading")}</p>
              ) : error ? (
                <p className="py-8 text-center text-sm text-live">{t("followListError")}</p>
              ) : users.length === 0 ? (
                <p className="py-8 text-center text-sm text-brown-sec">{t("followListEmpty")}</p>
              ) : (
                <ul>
                  {users.map((u) => (
                    <li key={u.id}>
                      <Link
                        href={{ pathname: "/profile/[handle]", params: { handle: u.handle } }}
                        onClick={onClose}
                        className="flex items-center gap-3 px-5 py-3 transition-colors"
                      >
                        <Avatar initial={u.initial} src={u.avatarUrl} size={40} solid />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-brown">{u.name}</p>
                          <p className="truncate text-sm text-brown-sec">@{u.handle}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
