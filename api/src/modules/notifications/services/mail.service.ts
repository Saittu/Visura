import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import nodemailer, { Transporter } from 'nodemailer'
import { SESv2Client } from '@aws-sdk/client-sesv2'

@Injectable()
export class MailService {
  private transporter: Transporter | null = null
  private readonly logger = new Logger(MailService.name)
  private readonly useSES: boolean = false

  constructor(private readonly config: ConfigService) {
    // Priorizar AWS SES se credenciais AWS estiverem disponíveis
    const awsRegion = this.config.get<string>('AWS_REGION')
    const awsAccessKey = this.config.get<string>('AWS_ACCESS_KEY_ID')
    const awsSecretKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY')

    if (awsRegion && awsAccessKey && awsSecretKey) {
      try {
        const sesClient = new SESv2Client({
          region: awsRegion,
          credentials: {
            accessKeyId: awsAccessKey,
            secretAccessKey: awsSecretKey
          }
        })
        // Nodemailer espera a propriedade 'ses' (não 'client') para AWS SDK v3/v2
        this.transporter = nodemailer.createTransport({
          SES: { ses: sesClient }
        })
        this.useSES = true
        this.logger.log('Email configurado com AWS SESv2')
      } catch (err: any) {
        this.logger.error(
          `Falha ao inicializar SESv2: ${err.message}. Fallback para SMTP.`
        )
      }
    } else {
      // Fallback para SMTP tradicional
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
        this.logger.log('Email configurado com SMTP')
      } else {
        this.logger.warn(
          'Email não configurado (AWS SES ou SMTP). Emails serão logados no console.'
        )
      }
    }
  }

  async sendVerificationEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`DEV EMAIL -> To: ${to}\nSubject: ${subject}\n${html}`)
      return
    }

    const from = this.useSES
      ? this.config.get('AWS_SES_FROM') ||
        this.config.get('SMTP_FROM') ||
        'noreply@visura.com'
      : this.config.get('SMTP_FROM') || 'noreply@visura.com'

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html
      })
      this.logger.log(`Email enviado para ${to}`)
    } catch (error) {
      this.logger.error(`Falha ao enviar email para ${to}: ${error.message}`)
      throw error
    }
  }
}
