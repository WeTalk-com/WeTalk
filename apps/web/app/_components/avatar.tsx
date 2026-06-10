type AvatarProps = {
  initial: string;
  /** taille en px (defaut 40) */
  size?: number;
  /** anneau rouge (live) */
  ring?: boolean;
};

export function Avatar({ initial, size = 40, ring = false }: AvatarProps) {
  return (
    <span
      className={`inline-grid place-items-center shrink-0 rounded-full bg-gold/20 text-gold font-semibold ${
        ring ? "ring-2 ring-live ring-offset-2 ring-offset-card" : ""
      }`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </span>
  );
}
