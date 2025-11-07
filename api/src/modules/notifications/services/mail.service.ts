import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import nodemailer, { Transporter } from 'nodemailer'

@Injectable()
export class MailService {
  private transporter: Transporter | null = null
  private readonly logger = new Logger(MailService.name)

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST')
    const port = this.config.get<number>('SMTP_PORT')
    const user = this.config.get<string>('SMTP_USER')
    const pass = this.config.get<string>('SMTP_PASS')

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass }
      })
    } else {
      this.logger.warn(
        'SMTP não configurado (.env). Emails serão logados no console em modo DEV.'
      )
    }
  }

  async sendVerificationEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`DEV EMAIL -> To: ${to}\nSubject: ${subject}\n${html}`)
      return
    }

    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM') || 'no-reply@visura.local',
      to,
      subject,
      html
    })
  }
}
