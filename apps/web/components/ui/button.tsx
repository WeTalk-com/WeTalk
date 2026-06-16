import { Link } from "@/i18n/navigation";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "outline";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-gold text-white shadow-gold hover:brightness-105",
  outline: "border border-border bg-card text-brown hover:bg-cream",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-5 text-sm",
  md: "h-11 px-6",
  lg: "h-14 px-7 font-bold",
};

type SharedProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type Props =
  | (SharedProps &
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedProps> & {
        href?: undefined;
      })
  | (SharedProps &
      Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        keyof SharedProps | "href"
      > & { href: string });

/**
 * Bouton de marque (pilule doree). Rend un <Link> si `href` est fourni,
 * sinon un <button type="button"> par defaut.
 */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Props) {
  const cls = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (rest.href !== undefined) {
    return (
      <Link
        className={cls}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
          href: string;
        })}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
