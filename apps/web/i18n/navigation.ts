import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Wrappers de navigation conscients de la locale.
 * A utiliser partout a la place de `next/link` et `next/navigation`.
 * Les chemins manipules ici sont SANS prefixe de locale (ex. "/home").
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
