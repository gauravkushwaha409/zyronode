import { IsString, MinLength } from 'class-validator'

export class SetPasswordDto {
  @IsString()
  token!: string

  @IsString()
  @MinLength(8)
  new_password!: string
}
