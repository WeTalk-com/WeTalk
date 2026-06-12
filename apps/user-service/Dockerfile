FROM node:20-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/user-service/package.json ./apps/user-service/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
RUN npm ci

COPY packages/typescript-config ./packages/typescript-config
COPY apps/user-service ./apps/user-service
RUN npm run build --workspace=user-service

FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/user-service/package.json ./apps/user-service/package.json
RUN npm ci --omit=dev --workspace=user-service
COPY --from=builder /app/apps/user-service/dist ./apps/user-service/dist

EXPOSE 4001
WORKDIR /app/apps/user-service
CMD ["node", "dist/index.js"]