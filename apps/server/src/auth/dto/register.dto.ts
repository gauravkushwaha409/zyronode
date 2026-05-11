import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'


export class RegisterDto {
  @IsString()
  @IsOptional()
  firstName?: string

  @IsString()
  @IsOptional()
  lastName?: string


  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  password!: string

  @IsString()
  @IsOptional()
  profile?: string


}