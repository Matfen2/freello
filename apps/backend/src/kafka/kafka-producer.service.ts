import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { TaskEventProducer } from './producers/TaskEventProducer';
import { TaskEvent } from './task-event.types';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer!: TaskEventProducer;

  async onModuleInit(): Promise<void> {
    this.producer = await TaskEventProducer.create();
    this.logger.log('✅ Kafka producer connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }

  async emitTaskEvent(event: TaskEvent): Promise<void> {
    try {
      await this.producer.send(event);
      this.logger.log(`📤 ${event.eventType} → task ${event.taskId}`);
    } catch (error) {
      this.logger.error(`Failed to emit ${event.eventType}`, error);
    }
  }
}