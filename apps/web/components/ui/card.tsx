import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Surface "carte" (fond blanc, bordure, coins arrondis). Polymorphe via `as`. */
export function Card({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={cn("rounded-2xl border border-border bg-card", className)}>
      {children}
    </Tag>
  );
}
