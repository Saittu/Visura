import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator'

// DTO de entrada com validação. Nome único para evitar conflito com interface do shared.
export class CreatePostInputDto {
  // Aceita 'text' do frontend; será mapeado para 'content'
  @IsOptional()
  @IsString()
  @MaxLength(500)
  text?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  content?: string

  @IsOptional()
  @IsUrl()
  imageUrl?: string | null
}
