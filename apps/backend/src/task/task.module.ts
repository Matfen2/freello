import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { OutboxEvent } from '../outbox/outbox-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, OutboxEvent])],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}