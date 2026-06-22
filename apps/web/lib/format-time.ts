export function formatTimeAgo(iso: string, locale: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—";
  const diffSec = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "narrow" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (diffSec >= secs) return rtf.format(-Math.floor(diffSec / secs), unit);
  }
  return rtf.format(0, "second");
}
