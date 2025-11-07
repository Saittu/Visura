import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MailService } from './services/mail.service'
import { SmsService } from './services/sms.service'

@Module({
  imports: [ConfigModule],
  providers: [MailService, SmsService],
  exports: [MailService, SmsService]
})
export class NotificationsModule {}
