"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/cn";

type AvatarProps = {
  initial: string;
  /** taille en px (defaut 40) */
  size?: number;
  /** anneau rouge (live) */
  ring?: boolean;
  /** fond dore plein + texte blanc (utilisateur courant) */
  solid?: boolean;
  /** URL de la photo de profil — remplace l'initiale si définie et valide */
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
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full",
        ring && "ring-2 ring-live ring-offset-2 ring-offset-card",
      )}
      style={{ width: size, height: size }}
    >
      {src && (
        <AvatarPrimitive.Image src={src} alt={alt} className="size-full object-cover" />
      )}
      <AvatarPrimitive.Fallback
        delayMs={src ? 600 : 0}
        className={cn(
          "flex size-full items-center justify-center font-semibold",
          solid ? "bg-gold text-white" : "bg-gold/20 text-gold",
        )}
        style={{ fontSize: size * 0.4 }}
      >
        {initial}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
