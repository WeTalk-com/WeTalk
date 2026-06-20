import { Playfair_Display, DM_Sans } from "next/font/google";

/** Polices de la marque, injectees en variables CSS (cf. globals.css). */
export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  weight: ["400", "600", "700", "800"],
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  weight: ["400", "500", "600", "700"],
});

/** Classes a poser sur <body> pour exposer les deux polices. */
export const fontVariables = `${playfair.variable} ${dmSans.variable}`;
