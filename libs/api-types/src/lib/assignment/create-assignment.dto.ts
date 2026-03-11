import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({
    example: '11111111-1111-1111-1111-111111111111',
    description: 'ID of the task being assigned',
  })
  @IsUUID()
  taskId!: string;

  @ApiProperty({
    example: '22222222-2222-2222-2222-222222222222',
    description: 'ID of the user assigned to the task',
  })
  @IsUUID()
  userId!: string;

  @ApiPropertyOptional({
    example: 'assignee',
    description: 'Role of the user for this task (assignee, reviewer, etc.)',
  })
  @IsOptional()
  @IsString()
  role?: string;
}