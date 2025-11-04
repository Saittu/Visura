# Visura Monorepo

Este repositório é um monorepo com os pacotes:
- `api/` (NestJS)
- `frontend/` (Next.js)
- `shared/` (libs/utilitários compartilhados)

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

## Scripts úteis

```powershell
# iniciar API (NestJS)
pnpm --filter api dev

# iniciar Frontend (Next.js)
pnpm --filter frontend dev

# lint focado apenas no código-fonte
pnpm lint
```
