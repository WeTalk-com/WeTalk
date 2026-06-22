type AvatarProps = {
  initial: string;
  /** taille en px (defaut 40) */
  size?: number;
  /** anneau rouge (live) */
  ring?: boolean;
  /** fond dore plein + texte blanc (utilisateur courant) */
  solid?: boolean;
  /** URL de la photo de profil (Fx10) — remplace l'initiale si définie */
  src?: string;
  /** texte alternatif de l'image */
  alt?: string;
};

export function Avatar({
  initial,
  size = 40,
  ring = false,
  solid = false,
  src,
  alt = "",
}: AvatarProps) {
  const base = `inline-grid place-items-center shrink-0 overflow-hidden rounded-full font-semibold ${
    solid ? "bg-gold text-white" : "bg-gold/20 text-gold"
  } ${ring ? "ring-2 ring-live ring-offset-2 ring-offset-card" : ""}`;

  return (
    <span className={base} style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}
