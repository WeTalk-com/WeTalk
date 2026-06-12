FROM node:20-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
RUN npm ci

COPY packages/ui ./packages/ui
COPY packages/typescript-config ./packages/typescript-config
COPY apps/web ./apps/web
RUN npm run build --workspace=web

FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
WORKDIR /app/apps/web
CMD ["node", "server.js"]