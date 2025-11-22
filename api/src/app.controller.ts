import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { PrismaService } from './prisma/prisma.service'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('health')
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1 as health`
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected'
      }
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      }
    }
  }

  @Get('db-test')
  async testDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1 as test`

      const userCount = await this.prisma.users.count()

      return {
        status: '✅ Conectado ao banco de dados',
        database: 'PostgreSQL',
        userCount,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: '❌ Erro ao conectar',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
}
