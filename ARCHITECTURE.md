# Arquitetura de Autenticação - Visura

## Visão Geral

Este projeto implementa uma arquitetura desacoplada entre frontend (Next.js) e backend (NestJS) usando o padrão **BFF (Backend For Frontend)** com **contratos baseados em interfaces**.

## Estrutura

```
visura/
├── shared/                    # Pacote compartilhado (@visura/shared)
│   └── src/
│       ├── contracts/         # Interfaces de serviço
│       │   └── IAuthService.ts
│       ├── types/             # DTOs e modelos de domínio
│       │   └── auth.types.ts
│       └── constants/         # Enums e constantes
│           └── auth.constants.ts
│
├── frontend/                  # Next.js App Router
│   ├── app/
│   │   ├── api/auth/         # BFF - API Routes (proxy para backend)
│   │   │   ├── register/
│   │   │   ├── login/
│   │   │   ├── verify-email/
│   │   │   ├── verify-phone/
│   │   │   ├── send-phone-code/
│   │   │   ├── refresh/
│   │   │   ├── me/
│   │   │   └── logout/
│   │   └── auth/             # Páginas de autenticação
│   │       ├── register/
│   │       └── login/
│   └── lib/
│       └── api.ts            # Client-side API helpers
│
└── api/                       # NestJS Backend
    └── src/modules/auth/     # Módulo de autenticação
```

## Padrão de Comunicação

### 1. Frontend → BFF (Next.js API Routes)

O frontend **nunca** se comunica diretamente com o backend NestJS. Todas as requisições passam pelas API Routes:

```typescript
// frontend/lib/api.ts
export async function register(payload: RegisterDto): Promise<AuthResult> {
  const res = await fetch('/api/auth/register', { // ← API Route interna
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return handleResponse<AuthResult>(res)
}
```

### 2. BFF → Backend NestJS

As API Routes fazem proxy das requisições para o backend:

```typescript
// frontend/app/api/auth/register/route.ts
export async function POST(request: Request) {
  const body: RegisterDto = await request.json()
  
  // Proxy para backend
  const res = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
  
  const data = await res.json()
  
  // Armazenar tokens em httpOnly cookies
  const cookieStore = await cookies()
  cookieStore.set('accessToken', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15 // 15 minutos
  })
  
  return NextResponse.json(data)
}
```

## Benefícios da Arquitetura

### 1. **Segurança**
- Tokens armazenados em **httpOnly cookies** (não acessíveis por JavaScript)
- Backend URL não exposta ao cliente
- CORS pode ser restrito apenas para o servidor Next.js
- Tokens nunca trafegam para o localStorage do navegador

### 2. **Desacoplamento**
- Frontend e backend não se conhecem diretamente
- Contratos compartilhados definem interfaces (`@visura/shared`)
- Backend pode ser substituído sem alterar o frontend (desde que respeite os contratos)

### 3. **Type Safety**
- TypeScript end-to-end
- DTOs compartilhados entre frontend e backend
- Intellisense completo nos dois lados

### 4. **Manutenibilidade**
- Lógica de proxy centralizada nas API Routes
- Fácil adicionar autenticação, rate limiting, caching
- Transformação de dados acontece na camada BFF

## Fluxo de Autenticação

### Registro + Verificação

```
1. Usuário preenche formulário
   └─> frontend/app/auth/register/page.tsx

2. Submit chama lib/api.ts::register()
   └─> POST /api/auth/register (Next.js API Route)

3. API Route faz proxy para backend
   └─> POST http://localhost:3333/auth/register (NestJS)

4. Backend cria usuário e retorna tokens
   └─> { accessToken, refreshToken, userId }

5. API Route armazena tokens em httpOnly cookies
   └─> cookies.set('accessToken', ..., { httpOnly: true })

6. Frontend recebe userId e abre modal de verificação de e-mail
   └─> <VerifyEmailModal userId={userId} />

7. Modal submete código de verificação
   └─> POST /api/auth/verify-email (API Route)
   └─> POST http://localhost:3333/auth/verify-email (NestJS)

8. Após e-mail verificado, abre modal de telefone
   └─> <VerifyPhoneModal userId={userId} />

9. Após telefone verificado, redireciona para login
   └─> router.push('/auth/login')
```

### Login

```
1. Usuário submete credenciais
   └─> POST /api/auth/login

2. Backend valida e retorna tokens
   └─> API Route armazena em cookies

3. Frontend redireciona para dashboard
   └─> Cookies são enviados automaticamente em requests subsequentes
```

### Acesso a Recursos Protegidos

```
1. Frontend chama endpoint protegido
   └─> GET /api/auth/me

2. API Route extrai token do cookie
   └─> const token = cookieStore.get('accessToken')

3. Faz request autenticado para backend
   └─> GET http://localhost:3333/auth/me
   └─> headers: { Authorization: `Bearer ${token}` }

4. Retorna dados do usuário
```

## Configuração

### 1. Variáveis de Ambiente

Crie `frontend/.env.local`:

```env
BACKEND_API_URL=http://localhost:3333
```

### 2. Instalar Dependências

```bash
# Na raiz do projeto
pnpm install
```

### 3. Configurar TypeScript Path Mapping

Já configurado em `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@visura/shared": ["../shared/src/index.ts"]
    }
  }
}
```

## Tipos Compartilhados

### DTOs (Data Transfer Objects)

```typescript
// shared/src/types/auth.types.ts
export interface RegisterDto {
  email: string
  username: string
  password: string
  name: string
  telephone: string // E.164 format: +5543991155104
}

export interface LoginDto {
  email: string
  password: string
}

export interface VerifyEmailDto {
  code: string // 6 dígitos
}

export interface VerifyPhoneDto {
  userId: string
  code: string // 6 dígitos
}
```

### Modelos de Domínio

```typescript
export interface User {
  id: string
  email: string
  username: string
  name: string
  telephone: string
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: Date
}

export interface AuthResult {
  user: User
  accessToken: string
  refreshToken: string
}
```

## Contratos

```typescript
// shared/src/contracts/IAuthService.ts
export interface IAuthService {
  register(data: RegisterDto): Promise<AuthResult>
  login(data: LoginDto): Promise<AuthResult>
  verifyEmail(data: VerifyEmailDto): Promise<MessageResponse>
  sendPhoneCode(userId: string): Promise<MessageResponse>
  verifyPhone(data: VerifyPhoneDto): Promise<MessageResponse>
  refreshToken(refreshToken: string): Promise<AuthResult>
  getProfile(userId: string): Promise<User>
  logout(): Promise<void>
}
```

## Formato de Telefone

Use o formato internacional **E.164**:

```
+[código do país][DDD sem zero][número]

Exemplos:
+5543991155104  ✅ (Brasil, DDD 43, número 99115-5104)
+5511987654321  ✅ (Brasil, DDD 11, número 98765-4321)
043991155104    ❌ (falta +55)
+55043991155104 ❌ (zero no DDD)
```

## Segurança

### Cookies httpOnly

```typescript
cookieStore.set('accessToken', token, {
  httpOnly: true,     // Não acessível via JavaScript
  secure: true,       // Apenas HTTPS (produção)
  sameSite: 'lax',    // Proteção CSRF
  maxAge: 60 * 15,    // 15 minutos
  path: '/'
})
```

### CORS (Configuração Backend Recomendada)

```typescript
// api/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000', // Apenas Next.js server
  credentials: true
})
```

## Próximos Passos

- [ ] Implementar refresh token automático no frontend
- [ ] Adicionar middleware de autenticação nas páginas protegidas
- [ ] Implementar rate limiting nas API Routes
- [ ] Adicionar logging e monitoramento
- [ ] Configurar CORS restrito no backend
- [ ] Adicionar testes E2E do fluxo completo

## Referências

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [httpOnly Cookies](https://owasp.org/www-community/HttpOnly)
- [BFF Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)
- [E.164 Phone Format](https://www.twilio.com/docs/glossary/what-e164)
