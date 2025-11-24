import { defineConfig } from 'prisma/config'

// Usar process.env diretamente para garantir leitura em produção
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  engine: 'classic',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/postgres'
  }
})
