# Build context = repo root (monorepo). See docker-compose.yml.
FROM node:20-alpine AS base
WORKDIR /app

# --- Dependencies + build ---
FROM base AS builder
# Manifests first for layer caching
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/auth-service/package.json ./apps/auth-service/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
RUN npm ci

# Sources
COPY packages/typescript-config ./packages/typescript-config
COPY apps/auth-service ./apps/auth-service
RUN npm run build --workspace=auth-service

# --- Runtime ---
FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/auth-service/package.json ./apps/auth-service/package.json
RUN npm ci --omit=dev --workspace=auth-service
COPY --from=builder /app/apps/auth-service/dist ./apps/auth-service/dist

EXPOSE 4000
WORKDIR /app/apps/auth-service
CMD ["node", "dist/index.js"]
