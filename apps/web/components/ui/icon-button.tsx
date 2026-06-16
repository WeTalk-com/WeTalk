import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  /** Libelle accessible (obligatoire pour un bouton-icone). */
  label: string;
  children: ReactNode;
};

/** Bouton circulaire icone-seule (accent dore, hover creme). */
export function IconButton({
  label,
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`grid size-10 shrink-0 place-items-center rounded-full text-gold transition-colors hover:bg-cream ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
