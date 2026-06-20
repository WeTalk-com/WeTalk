# Build context
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies + build
FROM base AS builder
# npm ci valide le fichier de verrouillage par rapport à chaque package.json référencé dans package-lock.json. 
# Tout fichier manquant = la ci échoue
COPY package.json package-lock.json turbo.json ./
COPY apps/auth-service/package.json ./apps/auth-service/package.json
COPY apps/user-service/package.json ./apps/user-service/package.json
COPY apps/post-service/package.json ./apps/post-service/package.json
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
RUN npm run build --workspace=web

# Runtime avec next standalone
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
WORKDIR /app/apps/web
USER node
CMD ["node", "server.js"]
