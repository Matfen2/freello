import { SchemaRegistry, SchemaType } from '@kafkajs/confluent-schema-registry';
import { readFileSync } from 'fs';
import { join } from 'path';
import { KAFKA_CONFIG } from './config';
import { TaskEvent } from './task-event.types';

export class TaskEventAvro {
  private static instance: TaskEventAvro;
  private readonly registry: SchemaRegistry;
  private schemaId: number | null = null;

  private constructor() {
    this.registry = new SchemaRegistry({
      host: KAFKA_CONFIG.schemaRegistryUrl,
    });
  }

  static getInstance(): TaskEventAvro {
    if (!TaskEventAvro.instance) {
      TaskEventAvro.instance = new TaskEventAvro();
    }
    return TaskEventAvro.instance;
  }

  async ensureRegistered(): Promise<number> {
    if (this.schemaId) return this.schemaId;

    const avscPath = join(process.cwd(), 'apps/backend/avro/TaskEvent.avsc');
    const schema = readFileSync(avscPath, 'utf-8');

    const { id } = await this.registry.register(
      {
        type: SchemaType.AVRO,
        schema,
      },
      { subject: `${KAFKA_CONFIG.topics.taskEvents}-value` },
    );

    this.schemaId = id;
    return id;
  }

  async serialize(event: TaskEvent): Promise<Buffer> {
    const id = await this.ensureRegistered();
    return this.registry.encode(id, event);
  }

  async deserialize(buffer: Buffer): Promise<TaskEvent> {
    return this.registry.decode(buffer) as Promise<TaskEvent>;
  }
}