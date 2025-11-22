# ===========================
# Stage 1: Dependencies
# ===========================
FROM node:22-alpine3.20 AS deps
RUN apk add --no-cache libc6-compat openssl && apk upgrade --no-cache

WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar lockfile e workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY shared/package.json ./shared/
COPY api/package.json ./api/

# Instalar dependências (todas, incluindo devDeps para build)
RUN pnpm install --frozen-lockfile

# ===========================
# Stage 2: Builder
# ===========================
FROM node:22-alpine3.20 AS builder
RUN apk add --no-cache libc6-compat openssl && apk upgrade --no-cache

WORKDIR /app

# Reativar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar manifestos e lockfile para reinstalar somente API
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY api/package.json ./api/
COPY shared/package.json ./shared/

# Copiar código fonte completo
COPY shared ./shared
COPY api ./api
COPY tsconfig.base.json ./

# Instalar dependências do monorepo (inclui dev deps e bins) após copiar os workspaces
RUN pnpm install --frozen-lockfile

# Build shared primeiro
WORKDIR /app/shared
RUN pnpm run build || echo "No build script in shared"

# Build API
WORKDIR /app/api
# Gerar prisma client
RUN npx prisma generate || echo "Prisma generate falhou (verificar deps)"
# Compilar com TypeScript usando o bin gerado na raiz
RUN /app/node_modules/.bin/tsc -p tsconfig.build.json

# ===========================
# Stage 3: Production
# ===========================
FROM node:22-alpine3.20 AS runner
RUN apk add --no-cache openssl dumb-init && apk upgrade --no-cache

WORKDIR /app/api

# Criar user não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copiar apenas o necessário para produção
COPY --from=builder --chown=nestjs:nodejs /app/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/api/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/api/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/api/package.json ./package.json

# Copiar Prisma generated (client)
COPY --from=builder --chown=nestjs:nodejs /app/api/generated ./generated

# Variáveis de ambiente padrão
ENV NODE_ENV=production \
  PORT=3333

USER nestjs

EXPOSE 3333

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar dumb-init para lidar com sinais corretamente
ENTRYPOINT ["dumb-init", "--"]

# Rodar migrations antes de iniciar (opcional: comentar se preferir rodar separado)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
