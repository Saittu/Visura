import { IsNotEmpty, IsString, Length } from 'class-validator'

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Código deve ter 6 dígitos' })
  code: string
}
