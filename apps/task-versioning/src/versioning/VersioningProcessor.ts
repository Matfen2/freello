import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { TaskEventConsumer } from '../kafka/consumers/TaskEventConsumer';
import { TaskEventAvro } from '../kafka/schema-registry';
import { TaskEvent } from '../kafka/task-event.types';
import { kafkaConfig } from '../kafka/config';

const VERSIONING_DIR = process.env['VERSIONING_DIR'] ?? './versioning';
const CSV_FILE = join(VERSIONING_DIR, 'task-history.csv');
const CSV_HEADER =
  'recorded_at,event_type,task_id,project_id,title,description,status,estimation,occurred_at\n';

export class VersioningProcessor {
  private consumer!: TaskEventConsumer;
  private readonly avro = TaskEventAvro.getInstance();

  async start(): Promise<void> {
    await this.ensureCsvFile();

    this.consumer = await TaskEventConsumer.create(kafkaConfig.consumerGroup);
    await this.consumer.subscribe(true); // fromBeginning — replay all past events on first run

    console.log(`[VersioningProcessor] Listening on topic ${kafkaConfig.topics.taskEvents}...`);

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        try {
          const event = await this.avro.deserialize(message.value);
          await this.appendRow(event);
          console.log(`[VersioningProcessor] ✅ ${event.eventType} → task ${event.taskId}`);
        } catch (err) {
          console.error('[VersioningProcessor] ❌ Failed to process message', err);
        }
      },
    });
  }

  async stop(): Promise<void> {
    await this.consumer?.disconnect();
    console.log('[VersioningProcessor] Disconnected.');
  }

  private async ensureCsvFile(): Promise<void> {
    await mkdir(VERSIONING_DIR, { recursive: true });
    if (!existsSync(CSV_FILE)) {
      await appendFile(CSV_FILE, CSV_HEADER, 'utf-8');
    }
  }

  private async appendRow(event: TaskEvent): Promise<void> {
    const row =
      [
        new Date().toISOString(),
        event.eventType,
        event.taskId,
        event.projectId,
        this.escapeCsv(event.title),
        this.escapeCsv(event.description ?? ''),
        event.status,
        event.estimation ?? '',
        event.occurredAt,
      ].join(',') + '\n';

    await appendFile(CSV_FILE, row, 'utf-8');
  }

  private escapeCsv(value: string): string {
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}