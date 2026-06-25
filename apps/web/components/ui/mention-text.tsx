"use client";

import { Link } from "@/i18n/navigation";

export function MentionText({ text }: { text: string }) {
  // Découpe sur les @mentions (profil) et les #hashtags (recherche explore).
  const parts = text.split(/(?<!\w)(@\w{3,50}|#[\p{L}\p{N}_]+)/gu);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("@") && part.length >= 4) {
          return (
            <Link
              key={i}
              href={{ pathname: "/profile/[handle]", params: { handle: part.slice(1) } }}
              className="font-medium text-gold hover:underline"
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith("#") && part.length >= 2) {
          return (
            <Link
              key={i}
              href={{ pathname: "/explore", query: { tag: part.slice(1).toLowerCase() } }}
              className="font-medium text-gold hover:underline"
            >
              {part}
            </Link>
          );
        }
        return part;
      })}
    </>
  );
}
