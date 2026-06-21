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
COPY apps/media-service/package.json ./apps/media-service/package.json
COPY apps/notification-service/package.json ./apps/notification-service/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN npm ci

# Sources
COPY packages/typescript-config ./packages/typescript-config
COPY apps/notification-service ./apps/notification-service
RUN npm run build --workspace=notification-service

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
RUN npm ci --omit=dev --workspace=notification-service
COPY --from=builder /app/apps/notification-service/dist ./apps/notification-service/dist

EXPOSE 4003
WORKDIR /app/apps/notification-service
USER node
CMD ["node", "dist/index.js"]
