import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Twilio from 'twilio'

@Injectable()
export class SmsService {
  private client: Twilio.Twilio | null = null
  private readonly logger = new Logger(SmsService.name)

  constructor(private readonly config: ConfigService) {
    const sid = this.config.get<string>('TWILIO_ACCOUNT_SID')
    const token = this.config.get<string>('TWILIO_AUTH_TOKEN')

    if (sid && token) {
      this.client = Twilio(sid, token)
    } else {
      this.logger.warn(
        'Twilio não configurado (.env). SMS serão logados no console em modo DEV.'
      )
    }
  }

  async sendSms(to: string, body: string) {
    if (!this.client) {
      this.logger.log(`DEV SMS -> To: ${to}\n${body}`)
      return
    }

    const from = this.config.get<string>('TWILIO_FROM')
    if (!from) {
      throw new Error('TWILIO_FROM não configurado no .env')
    }

    await this.client.messages.create({ to, from, body })
  }
}
