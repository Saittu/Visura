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

    // Validar formato do SID (deve começar com AC)
    if (sid && token && sid.startsWith('AC')) {
      try {
        this.client = Twilio(sid, token)
        this.logger.log('Twilio configurado')
      } catch (err: any) {
        this.logger.error(
          `Falha ao inicializar Twilio: ${err.message}. SMS serão logados.`
        )
      }
    } else {
      this.logger.warn(
        'Twilio não configurado ou credenciais inválidas (.env). SMS serão logados no console em modo DEV.'
      )
    }
  }

  async sendSms(to: string, body: string) {
    if (!this.client) {
      this.logger.log(`DEV SMS -> To: ${to}\n${body}`)
      return
    }

    const from = this.config.get<string>('TWILIO_PHONE_NUMBER')
    if (!from) {
      throw new Error('TWILIO_PHONE_NUMBER não configurado no .env')
    }

    try {
      const message = await this.client.messages.create({ to, from, body })
      this.logger.log(`SMS enviado para ${to} (SID: ${message.sid})`)
    } catch (error) {
      this.logger.error(`Falha ao enviar SMS para ${to}: ${error.message}`)
      throw error
    }
  }
}
