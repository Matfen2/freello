import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Task } from './task.entity';
import { OutboxEvent } from '../outbox/outbox-event.entity';
import { CreateTaskDto, UpdateTaskDto, PaginationQueryDto } from '@freello/api-types';
import { TaskEvent, TaskEventType } from '../kafka/task-event.types';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly dataSource: DataSource,
  ) {}

  // ── Helpers cache (inchangés) ─────────────────────────────────────────
  private taskListKey(q: PaginationQueryDto, p?: string, s?: string) {
    return `tasks_list_${q.page}_${q.limit}_${q.sort}_${q.order}_${p ?? 'all'}_${s ?? 'all'}`;
  }
  private taskKey(id: string) { return `task_${id}`; }
  
  private async invalidateTaskCaches(id?: string): Promise<void> {
    try {
      if (id) await this.cache.del(this.taskKey(id));
      // Les clés de liste expirent via TTL — pas d'invalidation active
    } catch (err) {
      console.warn('Cache invalidation failed (non-blocking):', err);
    }
  }

  // ── Outbox helper ─────────────────────────────────────────────────────
  private buildEventPayload(task: Task, eventType: TaskEventType): TaskEvent {
    return {
      eventType,
      taskId: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description ?? null,
      status: task.status,
      estimation: task.estimation ?? null,
      occurredAt: new Date().toISOString(),
    };
  }

  // ── Read (inchangé) ───────────────────────────────────────────────────
  async findAll(query: PaginationQueryDto, projectId?: string, status?: string) {
    const key = this.taskListKey(query, projectId, status);
    const cached = await this.cache.get(key);
    if (cached) return cached;
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;
    const allowedSort = ['createdAt', 'updatedAt', 'title', 'status'];
    const sortField = allowedSort.includes(sort) ? sort : 'createdAt';
    const where: Record<string, unknown> = {};
    if (projectId) where['projectId'] = projectId;
    if (status) where['status'] = status;
    const [data, total] = await this.taskRepository.findAndCount({
      where, order: { [sortField]: order.toUpperCase() as 'ASC' | 'DESC' },
      skip: (page - 1) * limit, take: limit,
    });
    const result = { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    await this.cache.set(key, result);
    return result;
  }

  async findOne(id: string): Promise<Task> {
    const cached = await this.cache.get<Task>(this.taskKey(id));
    if (cached) return cached;
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task #${id} not found`);
    await this.cache.set(this.taskKey(id), task);
    return task;
  }

  // ── Write — transaction atomique task + outbox ────────────────────────
  async create(dto: CreateTaskDto): Promise<Task> {
    const task = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.getRepository(Task).save(dto);
      await manager.getRepository(OutboxEvent).save({
        aggregateType: 'task',
        aggregateId: saved.id,
        eventType: 'task.created',
        payload: this.buildEventPayload(saved, 'task.created'),
      });
      return saved;
    });
    await this.invalidateTaskCaches();
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const existing = await this.findOne(id);
    const task = await this.dataSource.transaction(async (manager) => {
      Object.assign(existing, dto);
      const saved = await manager.getRepository(Task).save(existing);
      await manager.getRepository(OutboxEvent).save({
        aggregateType: 'task',
        aggregateId: saved.id,
        eventType: 'task.updated',
        payload: this.buildEventPayload(saved, 'task.updated'),
      });
      return saved;
    });
    await this.invalidateTaskCaches(id);
    return task;
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(OutboxEvent).save({
        aggregateType: 'task',
        aggregateId: task.id,
        eventType: 'task.deleted',
        payload: this.buildEventPayload(task, 'task.deleted'),
      });
      await manager.getRepository(Task).remove(task);
    });
    await this.invalidateTaskCaches(id);
  }
}