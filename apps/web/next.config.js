import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

const securityHeaders = [
  // Interdit l'intégration dans une iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Empêche le MIME-sniffing du navigateur.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limite les infos de referer aux requêtes same-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Désactive les fonctionnalités navigateur non utilisées.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Précharge HTTPS pour la durée de session (1 an).
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sortie autonome pour l'image Docker (server.js minimal).
  output: "standalone",
  // Monorepo : trace les deps depuis la racine du repo pour un standalone complet.
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

// Sans routing i18n : la locale est lue dans un cookie (cf. i18n/request.ts).
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
