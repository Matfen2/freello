import { Kafka, Producer, Admin, Consumer } from 'kafkajs';
import { KAFKA_CONFIG } from './config';

export class KafkaClient {
  private static instance: KafkaClient;
  private readonly kafka: Kafka;

  private constructor() {
    this.kafka = new Kafka({
      clientId: 'freello-backend',
      brokers: [...KAFKA_CONFIG.brokers],
    });
  }

  static getInstance(): KafkaClient {
    if (!KafkaClient.instance) {
      KafkaClient.instance = new KafkaClient();
    }
    return KafkaClient.instance;
  }

  createProducer(): Producer {
    return this.kafka.producer({
      idempotent: KAFKA_CONFIG.producer.idempotent,
      maxInFlightRequests: KAFKA_CONFIG.producer.maxInFlightRequests,
    });
  }

  createConsumer(groupId: string): Consumer {
    return this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  createAdmin(): Admin {
    return this.kafka.admin();
  }
}