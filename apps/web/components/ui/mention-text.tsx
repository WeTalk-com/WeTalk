"use client";

import { Link } from "@/i18n/navigation";
import { tokenizeEmoji } from "@/lib/emoji";

// Rend un fragment de texte en remplaçant les emojis par leur image Apple (tous OS).
function EmojiText({ text }: { text: string }) {
  return (
    <>
      {tokenizeEmoji(text).map((tok, i) =>
        tok.type === "emoji" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={tok.url}
            alt={tok.value}
            className="inline-block size-[1.2em] align-[-0.2em]"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <span key={i}>{tok.value}</span>
        ),
      )}
    </>
  );
}

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
        return <EmojiText key={i} text={part} />;
      })}
    </>
  );
}
