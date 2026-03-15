import { Kafka, Consumer } from 'kafkajs';
import { kafkaConfig } from './config';

export class KafkaClient {
  private static instance: KafkaClient;
  private readonly kafka: Kafka;

  private constructor() {
    this.kafka = new Kafka({
      clientId: 'freello-task-versioning',
      brokers: [kafkaConfig.bootstrapServers],
    });
  }

  static create(): KafkaClient {
    if (!KafkaClient.instance) {
      KafkaClient.instance = new KafkaClient();
    }
    return KafkaClient.instance;
  }

  createConsumer(groupId: string): Consumer {
    return this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }
}