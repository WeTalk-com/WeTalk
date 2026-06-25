// Rendu des emojis en images Apple sur tous les OS (Windows/Android compris).
// Les données emoji-mart fournissent la correspondance natif → code "unified",
// qui est aussi le nom de fichier servi par le CDN emoji-datasource-apple.
import data from "@emoji-mart/data";

type EmojiData = { emojis: Record<string, { skins: { unified: string; native: string }[] }> };

// natif (ex. "😀") → unified (ex. "1f600"), construit une fois au chargement du module.
const nativeToUnified = new Map<string, string>();
for (const emoji of Object.values((data as EmojiData).emojis)) {
  for (const skin of emoji.skins) {
    nativeToUnified.set(skin.native, skin.unified);
  }
}

const CDN = "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64";

/** URL de l'image Apple d'un emoji, ou null si inconnu (emoji trop récent). */
export function emojiImageUrl(native: string): string | null {
  const unified = nativeToUnified.get(native);
  return unified ? `${CDN}/${unified}.png` : null;
}

export type EmojiToken = { type: "text"; value: string } | { type: "emoji"; value: string; url: string };

// Segmente par grapheme pour capturer les séquences ZWJ (ex. 👨‍👩‍👧) comme un seul emoji.
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Découpe un texte en segments texte / emoji (emoji connus seulement). */
export function tokenizeEmoji(text: string): EmojiToken[] {
  const tokens: EmojiToken[] = [];
  let buffer = "";
  for (const { segment } of segmenter.segment(text)) {
    const url = emojiImageUrl(segment);
    if (url) {
      if (buffer) {
        tokens.push({ type: "text", value: buffer });
        buffer = "";
      }
      tokens.push({ type: "emoji", value: segment, url });
    } else {
      buffer += segment;
    }
  }
  if (buffer) tokens.push({ type: "text", value: buffer });
  return tokens;
}
