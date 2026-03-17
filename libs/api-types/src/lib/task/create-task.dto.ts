import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export class CreateTaskDto {
  @ApiProperty({ example: 'Design homepage' })
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Story points ou heures estimées', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimation?: number;

  @ApiPropertyOptional({ enum: ['todo', 'in_progress', 'done'], default: 'todo' })
  @IsOptional()
  @IsString()
  @IsIn(['todo', 'in_progress', 'done'])
  status?: TaskStatus;

  @ApiProperty({ example: 'c0a80123-4567-890a-bcde-ffffffffffff' })
  @IsUUID()
  projectId!: string;
}