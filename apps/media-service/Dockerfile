# Build context
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies + build
FROM base AS builder
COPY package.json package-lock.json ./
COPY turbo.json ./
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

# Sources
COPY packages/typescript-config ./packages/typescript-config
COPY apps/media-service ./apps/media-service
RUN npm run build --workspace=media-service

# Runtime
FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/auth-service/package.json ./apps/auth-service/package.json
COPY apps/user-service/package.json ./apps/user-service/package.json
COPY apps/post-service/package.json ./apps/post-service/package.json
COPY apps/media-service/package.json ./apps/media-service/package.json
COPY apps/notification-service/package.json ./apps/notification-service/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN npm ci --omit=dev --workspace=media-service
COPY --from=builder /app/apps/media-service/dist ./apps/media-service/dist

# Dossier d'upload pré-créé et possédé par `node`
RUN mkdir -p /data/uploads && chown -R node:node /data/uploads

EXPOSE 4004
WORKDIR /app/apps/media-service
USER node
CMD ["node", "dist/index.js"]
