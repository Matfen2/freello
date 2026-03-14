import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export class CreateTaskDto {
  @ApiProperty({ example: 'Design homepage' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Story points ou heures estimées', minimum: 0 })
  @IsOptional()
  @IsString()
  @Min(0)
  description?: string;
  estimation?: number;

  @ApiProperty({
    enum: ['todo', 'in_progress', 'done'],
    default: 'todo',
  })
  @IsOptional()
  @IsString()
  @IsIn(['todo', 'in_progress', 'done'])
  status?: TaskStatus;

  @ApiProperty({
    example: 'c0a80123-4567-890a-bcde-ffffffffffff',
    description: 'ID of the project this task belongs to',
  })
  @IsUUID()
  projectId!: string;
}