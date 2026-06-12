FROM node:20-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/notification-service/package.json ./apps/notification-service/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
RUN npm ci

COPY packages/typescript-config ./packages/typescript-config
COPY apps/notification-service ./apps/notification-service
RUN npm run build --workspace=notification-service

FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/notification-service/package.json ./apps/notification-service/package.json
RUN npm ci --omit=dev --workspace=notification-service
COPY --from=builder /app/apps/notification-service/dist ./apps/notification-service/dist

EXPOSE 4003
WORKDIR /app/apps/notification-service
CMD ["node", "dist/index.js"]