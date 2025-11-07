import { IsNotEmpty, IsString, Length } from 'class-validator'

export class VerifyPhoneDto {
  @IsString({ message: 'Código deve ser uma string' })
  @IsNotEmpty({ message: 'Código não pode estar vazio' })
  @Length(6, 6, { message: 'Código deve ter exatamente 6 dígitos' })
  code: string
}
