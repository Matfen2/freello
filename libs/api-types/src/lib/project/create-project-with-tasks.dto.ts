import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  MinLength,
} from 'class-validator';

// Redéclaré localement pour compatibilité isolatedModules
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export class InitialTaskItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus = TaskStatus.TODO;
}

export class CreateProjectWithTasksDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [InitialTaskItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialTaskItemDto)
  tasks!: InitialTaskItemDto[];
}