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
app/                          # routing uniquement (App Router)
├─ globals.css                # design tokens (couleurs, ombres, fonts, animations)
├─ not-found.tsx              # 404 racine (hors locale, filet de securite)
└─ [locale]/                  # segment de langue (fr | en)
   ├─ layout.tsx              # provider i18n + polices + metadata
   ├─ page.tsx                # / → redirige vers /welcome
   ├─ welcome/page.tsx        # /welcome (landing publique)
   ├─ (auth)/login/page.tsx   # /login
   ├─ (app)/                  # shell connecte (sidebar + nav mobile)
   │  ├─ layout.tsx
   │  └─ home · explore · notifications · profile · settings
   ├─ [...rest]/page.tsx      # catch-all → 404 localise
   └─ error.tsx · not-found.tsx
components/                   # composants UI, groupes par domaine
├─ ui/                        # primitives (button, card, avatar, pill-tabs…)
├─ icons/                     # brand · demo · form
├─ layout/ home/ post/ explore/ notifications/
├─ create/ settings/ theme/ auth/ landing/
i18n/                         # routing · navigation · request (next-intl)
messages/                     # fr.json · en.json (textes de l'interface)
lib/                          # types.ts · fonts.ts · mock-data.ts
proxy.ts                      # middleware i18n (prefixe les URLs par locale)
```

> Données encore mockées (`lib/mock-data.ts`, types dans `lib/types.ts`) — le branchement API arrivera avec le back-end.

Import alias : `@/*` → racine de `apps/web` (ex. `@/components/ui/button`, `@/lib/types`).
