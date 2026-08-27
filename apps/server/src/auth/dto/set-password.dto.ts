import { IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SetPasswordDto {
  @ApiProperty({ description: 'Password reset token from email' })
  @IsString()
  token!: string

  @ApiProperty({ description: 'New password (min 8 characters)', example: 'newpassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  new_password!: string
}
