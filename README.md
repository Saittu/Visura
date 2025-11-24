# Visura Monorepo

Este repositório é um monorepo com os pacotes:
- `api/` (NestJS + Prisma + PostgreSQL)
- `frontend/` (Next.js 16 App Router)
- `shared/` (tipos e utilitários compartilhados)

## Arquitetura

### Backend (API)
- **Framework**: NestJS 11
- **Database**: PostgreSQL 16 (Prisma ORM)
- **Cache/Sessions**: Redis 7
- **Autenticação**: JWT (access + refresh tokens)
- **Storage**: AWS S3 para uploads (avatares, mídias de posts)
- **Notificações**: Twilio (SMS) e Nodemailer (Email)

### Frontend
- **Framework**: Next.js 16 com Turbopack
- **Arquitetura**: BFF (Backend For Frontend) - rotas `/api` fazem proxy para a API
- **Auth**: Cookies httpOnly para tokens
- **UI**: Componentes customizados (Radix UI base)

### Infraestrutura
- **Docker**: Multi-stage builds (dev com hot reload, prod otimizado)
- **Monorepo**: pnpm workspaces
- **CI/CD**: Husky + lint-staged para quality gates

## Husky e Git Hooks

Os hooks do Git (pre-commit, etc.) são gerenciados pelo Husky e são instalados automaticamente após a instalação de dependências.

- Instalação automática (via `prepare`):
  - O `package.json` contém: `"prepare": "husky install"`
  - Ao executar `pnpm install`, os hooks são (re)instalados em `.husky/`

- Fallback no Windows (se os hooks não aparecerem por algum motivo):
  - Execute um dos comandos abaixo:

```powershell
# reinstalar hooks manualmente
pnpm dlx husky install

# ou usando o script PowerShell do repositório
pwsh ./scripts/check-husky.ps1
```

- Verificações úteis:
```powershell
# verificar onde o Git procura hooks (deve ser .husky)
git config core.hooksPath

# testar rapidamente o pre-commit (deve rodar o lint-staged)
git commit --allow-empty -m "test: husky"
```

- Observações:
  - Este projeto usa ESLint (flat config) e lint-staged para formatar/lintar apenas arquivos staged.
  - Se o hook rodar e você vir a mensagem "lint-staged could not find any staged files", é porque nenhum arquivo foi adicionado ao commit.

## TypeScript

- Configuração compartilhada: `tsconfig.base.json`
- Pacotes herdam do base:
  - `api/tsconfig.json` (NestJS)
  - `frontend/tsconfig.json` (Next.js)
- O `tsconfig.json` na raiz foi removido para evitar redundância.

## Configuração AWS S3

O projeto usa AWS S3 para armazenamento de arquivos (avatares, mídias de posts).

### O que foi implementado:

1. **S3Service** (`api/src/modules/s3/s3.service.ts`)
   - Upload de arquivos com `@aws-sdk/lib-storage` (suporta multipart)
   - Download e exclusão de arquivos
   - Geração de nomes únicos com timestamp + random
   - Validação de existência de arquivos
   - Extração de keys de URLs públicas

2. **UploadController** (`api/src/modules/upload/upload.controller.ts`)
   - `POST /upload/avatar` - Upload de avatar do usuário (max 5MB, imagens)
   - `POST /upload/post-media` - Upload de mídia para posts (max 10MB, imagens/vídeos)
   - Validações automáticas de tipo e tamanho
   - Atualização do `avatar_url` no banco após upload

3. **Configuração** (`.env`)
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=sua-access-key
   AWS_SECRET_ACCESS_KEY=sua-secret-key
   AWS_S3_BUCKET=seu-bucket-name
   AWS_S3_PUBLIC_URL=https://seu-bucket.s3.us-east-1.amazonaws.com
   ```

4. **Estrutura de pastas no S3**
   - `avatars/` - Fotos de perfil
   - `posts/` - Mídias de posts (imagens e vídeos)

### Configuração do Bucket S3:

1. Crie o bucket no AWS Console
2. Configure permissões públicas de leitura (ou use CloudFront)
3. Adicione CORS policy:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

## Scripts úteis

```powershell
# Desenvolvimento local com Docker
docker compose -f infra/docker-compose.yml up

# Rebuild específico
docker compose -f infra/docker-compose.yml up --build api

# Instalar dependências
pnpm install

# Rodar API localmente (sem Docker)
cd api
pnpm run start:dev

# Rodar Frontend localmente
cd frontend
pnpm run dev

# Migrations Prisma
cd api
npx prisma migrate dev --name nome_da_migration
npx prisma studio  # Interface visual do banco

# Lint
pnpm lint
```

## Desenvolvimento: Verificação de Email/SMS

Em **desenvolvimento** (quando credenciais não estão configuradas), os códigos de verificação **não são enviados**, mas aparecem nos **logs do container**:

```powershell
# Ver códigos de verificação nos logs
docker logs visura-api | Select-String -Pattern "DEV EMAIL|DEV SMS"

# OU ver logs em tempo real
docker logs visura-api -f

# OU usar endpoint helper (DEV only)
curl http://localhost:3333/auth/dev/codes/seuemail@example.com
```

**Exemplo de saída:**
```
[MailService] DEV EMAIL -> To: user@example.com
Código: 551888

[SmsService] DEV SMS -> To: +5543991155104
Código: 884386
```

Use esses códigos nos endpoints `/auth/verify-email` e `/auth/verify-phone`.

## Configuração de Email e SMS (Produção)

### Opção 1: AWS SES (Recomendado para email)

O sistema prioriza AWS SES se as credenciais AWS estiverem disponíveis:

```env
# AWS (usado para S3 e SES)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key

# Email sender (deve ser verificado no AWS SES)
AWS_SES_FROM=noreply@seudominio.com
```

**Passos AWS SES:**
1. Acesse [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Verifique seu domínio ou email de envio
3. Configure DKIM e SPF records no seu DNS
4. Solicite saída do sandbox (produção) para enviar para qualquer email
5. Use as mesmas credenciais AWS do S3

### Opção 2: SMTP Genérico (Gmail, SendGrid, etc.)

Fallback se AWS não estiver configurado:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@visura.com
```

**Gmail:** 
- Use [App Password](https://support.google.com/accounts/answer/185833)
- Ative autenticação de 2 fatores primeiro
- Gere uma senha de app específica

**SendGrid/Mailgun:**
- Use as credenciais SMTP fornecidas
- Porta 587 (TLS) ou 465 (SSL)

### Twilio SMS

Configurar Twilio para envio de SMS:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_PHONE_NUMBER=+15551234567
```

**Passos Twilio:**
1. Crie conta em [twilio.com](https://www.twilio.com)
2. Compre um número de telefone (+55 para Brasil)
3. Copie Account SID e Auth Token do dashboard
4. Configure webhook URL se precisar receber respostas

**Sandbox Mode (Desenvolvimento):**
- Twilio Free Trial permite enviar SMS apenas para números verificados
- Adicione números de teste no console
- Upgrade para enviar para qualquer número

### Arquivo .env completo (Produção)

Crie `.env` na raiz do monorepo:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/visura?schema=public

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=sua-chave-secreta-complexa-aqui
JWT_REFRESH_SECRET=outra-chave-secreta-para-refresh

# AWS (S3 + SES)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_S3_BUCKET=visura-uploads
AWS_S3_PUBLIC_URL=https://visura-uploads.s3.us-east-1.amazonaws.com
AWS_SES_FROM=noreply@seudominio.com

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu-token
TWILIO_PHONE_NUMBER=+5511999999999

# SMTP (opcional, se não usar SES)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASS=senha-de-app
SMTP_FROM=noreply@visura.com
```

### Testar configuração

```powershell
# Registrar novo usuário (vai tentar enviar email/SMS real)
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "username": "teste",
    "name": "Teste",
    "password": "senha123",
    "telephone": "+5511999999999"
  }'

# Verificar logs para confirmar envio
docker logs visura-api -f
```

Você verá:
- **Sucesso AWS SES:** `[MailService] Email enviado para teste@example.com`
- **Sucesso Twilio:** `[SmsService] SMS enviado para +5511999999999 (SID: SMxxx)`
- **Erro:** Mensagem de erro detalhada nos logs

## TODO - Próximos Passos

### Funcionalidades Core
- [ ] **Sistema de Posts**
  - [ ] Feed principal com infinite scroll
  - [ ] Criar post com texto + múltiplas imagens/vídeos
  - [ ] Editar/deletar post (com validação de ownership)
  - [ ] Like/Unlike com contadores em tempo real
  - [ ] Salvar posts (bookmark)

- [ ] **Perfil de Usuário**
  - [ ] Página de perfil (`/profile/[username]`)
  - [ ] Editar perfil (nome, bio, telefone)
  - [ ] Upload/atualização de avatar
  - [ ] Grid de posts do usuário
  - [ ] Estatísticas (posts, seguidores, seguindo)

- [ ] **Sistema de Mensagens**
  - [ ] Lista de conversas
  - [ ] Chat 1:1 em tempo real (WebSocket ou polling)
  - [ ] Enviar mensagens de texto
  - [ ] Enviar mídias no chat
  - [ ] Status de leitura (read receipts)
  - [ ] Notificações de novas mensagens

- [ ] **Verificação de Conta**
  - [ ] Enviar código de verificação por email
  - [ ] Validar token de email
  - [ ] Enviar código SMS via Twilio
  - [ ] Validar token de telefone
  - [ ] Badge de verificado no perfil

### Melhorias de Infraestrutura
- [ ] **Performance**
  - [ ] Cache de queries frequentes no Redis
  - [ ] Compressão de imagens no upload (Sharp/Jimp)
  - [ ] CDN (CloudFront) para assets estáticos
  - [ ] Lazy loading de componentes pesados

- [ ] **Segurança**
  - [ ] Rate limiting (express-rate-limit + Redis)
  - [ ] Helmet.js para headers de segurança
  - [ ] Sanitização de inputs (class-validator)
  - [ ] CSRF protection
  - [ ] Content Security Policy

- [ ] **Observabilidade**
  - [ ] Logs estruturados (Winston/Pino)
  - [ ] Health checks (`/health`, `/ready`)
  - [ ] Métricas (Prometheus)
  - [ ] Error tracking (Sentry)

### UX/UI
- [ ] **Frontend**
  - [ ] Dark/Light mode toggle persistente
  - [ ] Skeleton loaders durante carregamento
  - [ ] Toast notifications (Sonner/React-Hot-Toast)
  - [ ] Modal de confirmação para ações destrutivas
  - [ ] Paginação/Infinite scroll nos feeds
  - [ ] Preview de links (Open Graph)
  - [ ] Drag & drop para upload de arquivos

- [ ] **Mobile**
  - [ ] PWA (Progressive Web App)
  - [ ] Manifest.json e service worker
  - [ ] Push notifications
  - [ ] Splash screen
  - [ ] Instalação no home screen

### Testes
- [ ] **Backend**
  - [ ] Unit tests (Jest) para services
  - [ ] E2E tests para rotas críticas (Supertest)
  - [ ] Mocks do Prisma e S3

- [ ] **Frontend**
  - [ ] Component tests (Jest + Testing Library)
  - [ ] E2E tests (Playwright)
  - [ ] Visual regression tests (Chromatic)

### DevOps
- [ ] **CI/CD**
  - [ ] GitHub Actions para build e testes
  - [ ] Deploy automático (Vercel/Railway/AWS ECS)
  - [ ] Database migrations automáticas
  - [ ] Rollback strategy

- [ ] **Monitoramento**
  - [ ] Uptime monitoring (UptimeRobot/Pingdom)
  - [ ] APM (Application Performance Monitoring)
  - [ ] Database query analysis
  - [ ] Cost alerts (AWS Budget)

### Documentação
- [ ] API docs com Swagger/OpenAPI
- [ ] Arquitetura de decisões (ADRs)
- [ ] Contributing guide
- [ ] Deployment guide (staging + produção)
