// Formate une date ISO en libelle relatif localise ("il y a 2 h" / "2h ago").
// Utilise l'API navigateur Intl.RelativeTimeFormat (zero dependance).
export function formatTimeAgo(iso: string, locale: string): string {
  const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    style: "narrow",
  });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  // Plus grande unite donnant une valeur >= 1, sinon "maintenant".
  for (const [unit, secs] of units) {
    if (diffSec >= secs) return rtf.format(-Math.floor(diffSec / secs), unit);
  }
  return rtf.format(0, "second");
}
