export type TaskEventType = 'task.created' | 'task.updated' | 'task.deleted';

export interface TaskEvent {
  eventType: TaskEventType;
  taskId: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  estimation: number | null;
  occurredAt: string;
}