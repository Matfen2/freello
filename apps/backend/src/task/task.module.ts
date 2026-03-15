import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), KafkaModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}