import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website redesign' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Q1 goals and landing page' })
  @IsOptional()
  @IsString()
  description?: string;
}