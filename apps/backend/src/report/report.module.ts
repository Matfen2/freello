import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../task/task.entity';
import { Project } from '../project/project.entity';
import { TaskExportService } from './task-export.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Project])],
  providers: [TaskExportService],
})
export class ReportModule {}