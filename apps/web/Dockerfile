# Build context
FROM node:20-alpine AS base
WORKDIR /app
# libc6-compat : requis pour charger le binaire natif SWC de Next sur Alpine/musl (sinon "Failed to load SWC binary").
RUN apk add --no-cache libc6-compat

# Dependencies + build
FROM base AS builder
# npm ci valide le fichier de verrouillage par rapport à chaque package.json référencé dans package-lock.json. 
# Tout fichier manquant = la ci échoue
COPY package.json package-lock.json turbo.json ./
COPY apps/auth-service/package.json ./apps/auth-service/package.json
COPY apps/user-service/package.json ./apps/user-service/package.json
COPY apps/post-service/package.json ./apps/post-service/package.json
COPY apps/media-service/package.json ./apps/media-service/package.json
COPY apps/notification-service/package.json ./apps/notification-service/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN npm ci

COPY packages/ui ./packages/ui
COPY packages/typescript-config ./packages/typescript-config
COPY apps/web ./apps/web
# NEXT_PUBLIC_* doit etre present au build : Next l'inline dans le bundle client.
ENV NEXT_PUBLIC_API_URL=/api
# Cle Giphy (publique cote client) passee en build-arg depuis .env via compose.
# Défaut en dur sur l'ARG : Dokploy n'honore pas les build.args du compose, donc on garantit
# que la clé (publique côté client) est présente au `next build` pour être inlinée par Next.
ARG NEXT_PUBLIC_GIPHY_KEY=LnSVpI5Ejk5h8ei37J1ETYnwJkyT4g39
ENV NEXT_PUBLIC_GIPHY_KEY=$NEXT_PUBLIC_GIPHY_KEY
RUN npm run build --workspace=web

# Runtime avec next standalone
FROM base AS runner
ENV NODE_ENV=production
# Next standalone lit HOSTNAME pour son bind ; Docker le met a l'id du conteneur.
# On force 0.0.0.0 pour que localhost (healthcheck) et le nom de service repondent.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
# Next standalone n'inclut pas public/ : on le copie pour servir les assets statiques.
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
WORKDIR /app/apps/web
USER node
CMD ["node", "server.js"]
