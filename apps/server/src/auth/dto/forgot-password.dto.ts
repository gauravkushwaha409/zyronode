import { IsEmail } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address to send password reset link', example: 'john@example.com' })
  @IsEmail()
  email!: string
}
