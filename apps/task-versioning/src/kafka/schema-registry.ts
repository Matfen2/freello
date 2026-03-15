import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { kafkaConfig } from './config';
import { TaskEvent } from './task-event.types';

export class TaskEventAvro {
  private static instance: TaskEventAvro;
  private readonly registry: SchemaRegistry;

  private constructor() {
    this.registry = new SchemaRegistry({
      host: kafkaConfig.schemaRegistryUrl,
    });
  }

  static getInstance(): TaskEventAvro {
    if (!TaskEventAvro.instance) {
      TaskEventAvro.instance = new TaskEventAvro();
    }
    return TaskEventAvro.instance;
  }

  async deserialize(buffer: Buffer): Promise<TaskEvent> {
    return this.registry.decode(buffer) as Promise<TaskEvent>;
  }
}