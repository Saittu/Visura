import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './modules/app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
