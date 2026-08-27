import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiPropertyOptional({ description: 'User first name', example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiPropertyOptional({ description: 'User last name', example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiProperty({ description: 'User email address', example: 'john@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ description: 'User password (min 8 characters)', example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsString()
  @IsOptional()
  profile?: string
}
