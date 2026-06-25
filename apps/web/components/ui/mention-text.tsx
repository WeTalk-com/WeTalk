"use client";

import { Link } from "@/i18n/navigation";

export function MentionText({ text }: { text: string }) {
  // Découpe sur les @mentions (profil) et les #hashtags (recherche explore).
  // Le username accepte lettres accentées et points internes (ex. @alexandre.françois),
  // sans avaler un point final de phrase (segments séparés par un point unique).
  const parts = text.split(/(?<!\w)(@[\p{L}\p{N}_]+(?:\.[\p{L}\p{N}_]+)*|#[\p{L}\p{N}_]+)/gu);
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
