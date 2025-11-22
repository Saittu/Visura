# 🐳 Docker & CI/CD Setup

Configuração de infraestrutura para o monorepo Visura.

## 📁 Estrutura

```
infra/
├── docker/
│   ├── api.DockerFile          # Backend NestJS (multi-stage)
│   ├── frontend.Dockerfile     # Frontend Next.js (standalone)
│   └── .dockerignore           # Otimização de build context
├── docker-compose.yml          # Dev local (PostgreSQL + Redis + API + Frontend)
├── docker-compose.prod.yml     # Produção (opcional)
└── ci/
    └── deploy.yml              # Workflows reutilizáveis
```

---

## 🚀 Início Rápido

### 1. Setup inicial

```bash
# Copiar variáveis de ambiente
cp .env.example .env

# Editar com suas credenciais
# Importante: JWT_SECRET, TWILIO, SMTP
```

### 2. Rodar com Docker Compose

```bash
# Build e start de todos os serviços
docker compose -f infra/docker-compose.yml up --build

# Ou em background
docker compose -f infra/docker-compose.yml up -d

# Ver logs
docker compose -f infra/docker-compose.yml logs -f api
docker compose -f infra/docker-compose.yml logs -f frontend
```

**Serviços disponíveis:**
- Frontend: http://localhost:3000
- API: http://localhost:3333
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 3. Rodar migrations

```bash
# Dentro do container da API
docker compose -f infra/docker-compose.yml exec api npx prisma migrate dev

# Ou criar migration nova
docker compose -f infra/docker-compose.yml exec api npx prisma migrate dev --name nome_da_migration
```

### 4. Parar serviços

```bash
# Parar
docker compose -f infra/docker-compose.yml down

# Parar e remover volumes (apaga DB)
docker compose -f infra/docker-compose.yml down -v
```

---

## 🏗️ Build Individual

### Backend (API)

```bash
# Build
docker build -f infra/docker/api.DockerFile -t visura-api:latest .

# Run
docker run -p 3333:3333 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your_secret \
  visura-api:latest
```

### Frontend

```bash
# Build
docker build -f infra/docker/frontend.Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000/api \
  --build-arg BACKEND_API_URL=http://api:3333 \
  -t visura-frontend:latest .

# Run
docker run -p 3000:3000 visura-frontend:latest
```

---

## 🔧 Desenvolvimento Local (sem Docker)

```bash
# Terminal 1: PostgreSQL
docker run -p 5432:5432 \
  -e POSTGRES_USER=visura \
  -e POSTGRES_PASSWORD=visura_dev_password \
  -e POSTGRES_DB=visura_dev \
  postgres:16-alpine

# Terminal 2: Redis (opcional)
docker run -p 6379:6379 redis:7-alpine

# Terminal 3: Backend
cd api
pnpm install
pnpm run prisma:generate
pnpm run prisma:migrate:dev
pnpm run start:dev

# Terminal 4: Frontend
cd frontend
pnpm install
pnpm run dev
```

---

## 🧪 CI/CD

### GitHub Actions

O workflow `.github/workflows/ci.yml` executa:

1. **Lint & Type Check** (em todo push/PR)
2. **Tests** (com PostgreSQL container)
3. **Build Docker Images** (em push para main/developer)
4. **Deploy** (apenas em main)

### Secrets necessários

Configurar em **Settings → Secrets and variables → Actions**:

```
DOCKER_USERNAME           # Docker Hub (opcional)
DOCKER_PASSWORD           # Docker Hub (opcional)
RAILWAY_TOKEN             # Para deploy Railway
VERCEL_TOKEN              # Para deploy Vercel
VERCEL_ORG_ID             # Vercel org
VERCEL_PROJECT_ID         # Vercel project
NEXT_PUBLIC_API_URL       # URL pública da API
BACKEND_API_URL           # URL interna (Docker)
```

---

## 🚢 Deploy em Produção

### Opção 1: Railway (Backend) + Vercel (Frontend)

**Railway:**
```bash
# Instalar CLI
npm i -g @railway/cli

# Login
railway login

# Link projeto
railway link

# Deploy
railway up
```

Configurar variáveis de ambiente no dashboard Railway (DATABASE_URL é automático).

**Vercel:**
```bash
# Instalar CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Opção 2: Docker Compose em VPS

```bash
# Copiar arquivos
scp -r infra/ user@server:/app/
scp docker-compose.prod.yml user@server:/app/

# SSH no servidor
ssh user@server

cd /app
docker compose -f docker-compose.prod.yml up -d
```

---

## 📊 Monitoramento

### Logs

```bash
# Todos
docker compose logs -f

# API apenas
docker compose logs -f api

# Últimas 100 linhas
docker compose logs --tail=100 api
```

### Health Checks

- API: http://localhost:3333/health
- Frontend: http://localhost:3000/api/health

### Database

```bash
# Conectar no Postgres
docker compose exec postgres psql -U visura -d visura_dev

# Ver tabelas
\dt

# Ver dados
SELECT * FROM users LIMIT 10;
```

---

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs de erro
docker compose logs api

# Entrar no container
docker compose exec api sh

# Ver variáveis de ambiente
docker compose exec api env
```

### Build lento

```bash
# Limpar cache do Docker
docker builder prune -a

# Rebuild sem cache
docker compose build --no-cache
```

### Porta já em uso

```bash
# Ver o que está usando a porta
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Matar processo ou trocar porta no docker-compose.yml
```

### Migrations falham

```bash
# Reset database (⚠️ apaga dados)
docker compose down -v
docker compose up -d postgres
docker compose exec api npx prisma migrate reset --force
```

---

## 📝 Boas Práticas

✅ **Faça:**
- Sempre use `.env` para secrets (nunca commite)
- Rode migrations antes de deploy
- Use health checks
- Monitore logs em produção
- Versione imagens Docker (`visura-api:v1.0.0`)

❌ **Evite:**
- Hardcoded secrets no código
- Rodar migrations em produção manualmente
- Expor portas do DB publicamente
- Usar `:latest` em produção

---

## 🔗 Links Úteis

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

## 📞 Suporte

Problemas? Abra uma issue no repositório ou entre em contato com a equipe.
