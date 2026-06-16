export type ThemeId = "amber" | "rose" | "dark";

/**
 * Themes disponibles (id technique + pastille de couleur).
 * Les libelles sont traduits via next-intl (namespace "theme").
 */
export const THEMES: { id: ThemeId; swatch: string }[] = [
  { id: "amber", swatch: "#ba7517" },
  { id: "rose", swatch: "#c0552e" },
  { id: "dark", swatch: "#1a1411" },
];

export const THEME_IDS = THEMES.map((t) => t.id);

export const DEFAULT_THEME: ThemeId = "amber";
