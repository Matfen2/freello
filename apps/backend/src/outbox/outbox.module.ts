import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEvent } from './outbox-event.entity';
import { OutboxPollerService } from './outbox-poller.service';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OutboxEvent]),
    KafkaModule,
  ],
  providers: [OutboxPollerService],
})
export class OutboxModule {}