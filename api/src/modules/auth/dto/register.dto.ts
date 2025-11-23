import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches
} from 'class-validator'

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string

  @IsString()
  @IsNotEmpty({ message: 'Nome de usuário é obrigatório' })
  @MinLength(3, { message: 'Nome de usuário deve ter no mínimo 3 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Nome de usuário deve conter apenas letras, números e underscore'
  })
  username: string

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string

  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string

  @IsString()
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @Matches(/^\+?[1-9]\d{1,14}$/i, {
    message: 'Telefone inválido'
  })
  telephone: string
}
