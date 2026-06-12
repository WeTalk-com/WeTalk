# WeTalk — Web

Front-end du réseau social **WeTalk** (« the warm side of social »).
Application Next.js (App Router) au sein du monorepo Turborepo.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (tokens dans `app/globals.css` via `@theme`)
- **Polices** `next/font` : Playfair Display (titres) + DM Sans (corps)
- **Icônes** : `lucide-react` (+ quelques SVG inline pour login/landing)

## Démarrer

```bash
# depuis la racine du monorepo
npm install
npm run dev -w web     # http://localhost:3000
```

## Scripts

| Script | Rôle |
| --- | --- |
| `npm run dev -w web` | serveur de dev (port 3000) |
| `npm run build -w web` | build de production |
| `npm run lint -w web` | ESLint (max-warnings 0) |
| `npm run check-types -w web` | typegen + `tsc --noEmit` |

## Routes

| Route | Page |
| --- | --- |
| `/` | Landing (publique, animée) |
| `/home` | Fil d'actualité (app) |
| `/login` | Connexion / inscription / mot de passe oublié |

## Structure

```
app/
├─ globals.css            # design tokens (couleurs, ombres, fonts, animations)
├─ layout.tsx             # polices + metadata racine
├─ page.tsx               # / (landing, shell serveur + metadata)
├─ home/page.tsx          # /home
├─ (auth)/login/page.tsx  # /login
├─ error.tsx · not-found.tsx
└─ _components/
   ├─ ui/button.tsx       # bouton de marque reutilisable
   ├─ home/               # sidebar, rail, composer, tabs, mobile-nav
   ├─ landing/            # landing, phone-demo, hooks, icons
   ├─ avatar · post-card · post-actions
lib/mock-data.ts          # donnees factices (design-only)
```

> Données encore mockées (`lib/mock-data.ts`) — le branchement API arrivera avec le back-end.

Import alias : `@/*` → racine de `apps/web` (ex. `@/lib/mock-data`).
