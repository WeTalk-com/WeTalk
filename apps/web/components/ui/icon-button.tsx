"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/cn";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  /** Libelle accessible (obligatoire pour un bouton-icone). */
  label: string;
  children: ReactNode;
};

/** Bouton circulaire icone-seule (accent dore, hover creme). */
export function IconButton({ label, children, className = "", ...rest }: Props) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full text-gold transition-colors hover:bg-cream",
            className,
          )}
          {...rest}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={6}
          className="z-50 rounded-lg bg-brown px-2.5 py-1.5 text-xs font-medium text-canvas shadow-md"
        >
          {label}
          <Tooltip.Arrow className="fill-brown" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
