/* Icones d'actions de post (inline, calquees sur le mockup WeTalk). */

type IconProps = { className?: string };

/** Bulle de reponse (commentaire) — tracé du mockup. */
export function ReplyIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4.5 3v-6.5A7.5 7.5 0 0 1 11 8h2.5a7.5 7.5 0 0 1 7.5 3.5Z" />
    </svg>
  );
}

/** Coeur "J'aime" — tracé du mockup. Le remplissage est piloté par la classe `fill-*`. */
export function HeartIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20S3.5 15 3.5 9.2A4.2 4.2 0 0 1 12 6.5a4.2 4.2 0 0 1 8.5 2.7C20.5 15 12 20 12 20Z" />
    </svg>
  );
}
