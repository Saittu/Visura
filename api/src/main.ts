import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const corsEnv = process.env.CORS_ALLOWED_ORIGINS
  const allowedOrigins =
    corsEnv && corsEnv.length > 0
      ? corsEnv
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : ['http://localhost:3000']

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error(`Not allowed by CORS: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estão no DTO
      forbidNonWhitelisted: true, // Erra se vier algo fora do DTO
      transform: true, // Converte tipos automaticamente (ex: string -> number)
      transformOptions: {
        enableImplicitConversion: true // Permite conversão implícita de tipos ("10" -> 10)
      }
    })
  )

  const port = process.env.PORT || 3333
  await app.listen(port)

  console.log(`✅ Server is running on http://localhost:${port}`)
}

bootstrap()
