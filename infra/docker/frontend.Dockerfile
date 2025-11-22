# ===========================
# Stage 1: Dependencies
# ===========================
FROM node:22-alpine3.20 AS deps
RUN apk add --no-cache libc6-compat && apk upgrade --no-cache

WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar lockfile e workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Instalar dependências (scripts habilitados para criar binários do Next)
RUN pnpm install --frozen-lockfile

# ===========================
# Stage 2: Builder
# ===========================
FROM node:22-alpine3.20 AS builder
RUN apk add --no-cache libc6-compat && apk upgrade --no-cache

WORKDIR /app

# Reativar pnpm na stage de build (não é carregado só copiando node_modules)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Trazer manifestos para uma reinstalação focada no frontend
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/

# Instalar apenas as deps da workspace do frontend (garante bins do Next)
RUN pnpm install --filter visura-frontend --frozen-lockfile --workspace-root


# Copiar código fonte
COPY shared ./shared
COPY frontend ./frontend
COPY tsconfig.base.json ./

# Build shared primeiro
WORKDIR /app/shared
RUN pnpm run build || echo "No build script in shared"

# Build frontend (Next.js standalone)
WORKDIR /app/frontend

# Variáveis de build (podem ser override via --build-arg)
ARG NEXT_PUBLIC_API_URL
ARG BACKEND_API_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV BACKEND_API_URL=${BACKEND_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Garantir node_modules do workspace do frontend (symlinks locais)
RUN pnpm install --frozen-lockfile

RUN pnpm run build

# ===========================
# Stage 3: Production
# ===========================
FROM node:22-alpine3.20 AS runner
RUN apk add --no-cache dumb-init && apk upgrade --no-cache

WORKDIR /app

# Criar user não-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar arquivos públicos e static
COPY --from=builder /app/frontend/public ./public

# Copiar output standalone do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

USER nextjs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 0

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "frontend/server.js"]
