/* Icones de marque partagees (inline, sans lib). */

type IconProps = { className?: string };

/** Badge "verifie" : rond bleu #1D9BF6 + check blanc. */
export function VerifiedBadge({ className }: IconProps) {
  return (
    <svg className={className ?? "size-4.5"} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#1D9BF6" />
      <path
        d="m8 12 2.5 2.5L16 9"
        stroke="#fff"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

