"use client";

import { Link } from "@/i18n/navigation";

export function MentionText({ text }: { text: string }) {
  const parts = text.split(/(?<!\w)(@\w{3,50})/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("@") && part.length >= 4 ? (
          <Link
            key={i}
            href={{ pathname: "/profile/[handle]", params: { handle: part.slice(1) } }}
            className="font-medium text-gold hover:underline"
          >
            {part}
          </Link>
        ) : (
          part
        ),
      )}
    </>
  );
}
