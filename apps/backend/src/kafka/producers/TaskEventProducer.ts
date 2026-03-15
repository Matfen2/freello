import { Producer } from 'kafkajs';
import { KafkaClient } from '../client';
import { TaskEventAvro } from '../schema-registry';
import { TaskEvent } from '../task-event.types';
import { KAFKA_CONFIG } from '../config';

export class TaskEventProducer {
  private producer: Producer;

  private constructor() {
    this.producer = KafkaClient.getInstance().createProducer();
  }

  static async create(): Promise<TaskEventProducer> {
    const instance = new TaskEventProducer();
    await instance.producer.connect();
    return instance;
  }

  async send(event: TaskEvent): Promise<void> {
    const value = await TaskEventAvro.getInstance().serialize(event);
    await this.producer.send({
      topic: KAFKA_CONFIG.topics.taskEvents,
      messages: [
        {
          key: event.taskId,
          value,
          headers: { eventType: event.eventType },
        },
      ],
      compression: 2, // gzip
    });
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }
}