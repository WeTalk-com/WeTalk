import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sortie autonome pour l'image Docker (server.js minimal).
  output: "standalone",
  // Monorepo : trace les deps depuis la racine du repo pour un standalone complet.
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
};

// Sans routing i18n : la locale est lue dans un cookie (cf. i18n/request.ts).
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
