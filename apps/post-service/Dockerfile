# Le contexte de build est la racine du dépôt.
FROM node:20-alpine AS base
WORKDIR /app

# --- Dépendances et compilation ---
FROM base AS builder
# Copie d'abord les manifestes pour réutiliser le cache.
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/post-service/package.json ./apps/post-service/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
RUN npm ci

# Code source.
COPY packages/typescript-config ./packages/typescript-config
COPY apps/post-service ./apps/post-service
RUN npm run build --workspace=post-service

# --- Exécution ---
FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/post-service/package.json ./apps/post-service/package.json
RUN npm ci --omit=dev --workspace=post-service
COPY --from=builder /app/apps/post-service/dist ./apps/post-service/dist

EXPOSE 4002
WORKDIR /app/apps/post-service
CMD ["node", "dist/index.js"]
