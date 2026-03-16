import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { OutboxEvent } from './outbox-event.entity';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { TaskEvent } from '../kafka/task-event.types';

@Injectable()
export class OutboxPollerService {
  private readonly logger = new Logger(OutboxPollerService.name);

  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepository: Repository<OutboxEvent>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  @Cron('*/5 * * * * *') // toutes les 5 secondes
  async poll(): Promise<void> {
    const pending = await this.outboxRepository.find({
      where: { emitted: false },
      order: { createdAt: 'ASC' },
      take: 100,
    });

    for (const event of pending) {
      try {
        await this.kafkaProducer.emitTaskEvent(event.payload as TaskEvent);
        await this.outboxRepository.update(event.id, {
          emitted: true,
          emittedAt: new Date(),
        });
      } catch (err) {
        // La ligne reste emitted=false → retenté au prochain cycle
        this.logger.error(`Failed to emit ${event.id}, will retry`, err);
      }
    }
  }
}