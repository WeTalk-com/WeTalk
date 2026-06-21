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

# Sources
COPY packages/typescript-config ./packages/typescript-config
COPY apps/message-service ./apps/message-service
RUN npm run build --workspace=message-service

# Runtime
FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/auth-service/package.json ./apps/auth-service/package.json
COPY apps/user-service/package.json ./apps/user-service/package.json
COPY apps/post-service/package.json ./apps/post-service/package.json
COPY apps/notification-service/package.json ./apps/notification-service/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN npm ci --omit=dev --workspace=message-service
COPY --from=builder /app/apps/message-service/dist ./apps/message-service/dist

EXPOSE 4004
WORKDIR /app/apps/message-service
USER node
CMD ["node", "dist/index.js"]
