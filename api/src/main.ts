import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: '*'
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estão no DTO
      forbidNonWhitelisted: true, // Erra se vier algo fora do DTO
      transform: true // Converte tipos automaticamente (ex: string -> number)
    })
  )

  const port = process.env.PORT || 3333
  await app.listen(port)

  console.log(`✅ Server is running on http://localhost:${port}`)
}

bootstrap()
