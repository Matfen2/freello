import { Consumer, ConsumerRunConfig } from 'kafkajs';
import { KafkaClient } from '../client';
import { kafkaConfig } from '../config';

export class TaskEventConsumer {
  private constructor(private readonly consumer: Consumer) {}

  static async create(groupId: string): Promise<TaskEventConsumer> {
    const consumer = KafkaClient.create().createConsumer(groupId);
    await consumer.connect();
    return new TaskEventConsumer(consumer);
  }

  async subscribe(fromBeginning = true): Promise<void> {
    await this.consumer.subscribe({
      topic: kafkaConfig.topics.taskEvents,
      fromBeginning,
    });
  }

  run(config: ConsumerRunConfig): Promise<void> {
    return this.consumer.run(config);
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }
}