import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ description: 'Organization name', example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Organization domain', example: 'acme.com' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ description: 'Onboarding configuration data', type: Object })
  @IsOptional()
  onboarding?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Logo image URL' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ description: 'Organization description', example: 'A great company' })
  @IsString()
  @IsOptional()
  description?: string;
}
