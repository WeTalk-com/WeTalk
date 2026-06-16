export type ThemeId = "amber" | "rose" | "dark";

/** Themes disponibles (id technique, libelle, pastille de couleur). */
export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "amber", label: "Amber", swatch: "#ba7517" },
  { id: "rose", label: "Rose", swatch: "#c0552e" },
  { id: "dark", label: "Dark", swatch: "#1a1411" },
];

export const THEME_IDS = THEMES.map((t) => t.id);

export const DEFAULT_THEME: ThemeId = "amber";
