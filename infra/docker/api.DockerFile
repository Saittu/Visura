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

# Vamos preservar a estrutura de workspaces do pnpm para que symlinks funcionem
WORKDIR /app

# Criar user não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copiar node_modules raiz (necessário para pnpm symlinks) e workspace api
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# Copiar pacote api (dist + prisma + package.json + generated)
COPY --from=builder --chown=nestjs:nodejs /app/api ./api

# Garantir permissões corretas
RUN chown -R nestjs:nodejs /app

# Variáveis de ambiente padrão
ENV NODE_ENV=production \
  PORT=3333

WORKDIR /app/api
USER nestjs

EXPOSE 3333

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]

# Rodar migrations chamando diretamente o binário JS do prisma (wildcard para versão)
# Se falhar, continua sem migrations (útil para Railway sem DATABASE_URL configurado ainda)
CMD ["sh", "-c", "PRISMA_JS=$(ls /app/node_modules/.pnpm/prisma@*/node_modules/prisma/build/index.js 2>/dev/null | head -1) && { [ -n \"$PRISMA_JS\" ] && node $PRISMA_JS migrate deploy || echo 'Prisma CLI not found, skipping migrations'; } ; node dist/main.js"]
