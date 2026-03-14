import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto, PaginationQueryDto } from '@freello/api-types';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  // ── Helpers ──────────────────────────────────────────────────────────
  private taskListKey(
    query: PaginationQueryDto,
    projectId?: string,
    status?: string,
  ): string {
    return `tasks_list_${query.page}_${query.limit}_${query.sort}_${query.order}_${projectId ?? 'all'}_${status ?? 'all'}`;
  }

  private taskKey(id: string): string {
    return `task_${id}`;
  }

  private async invalidateTaskCaches(id?: string): Promise<void> {
    if (id) await this.cache.del(this.taskKey(id));
    const keys = Array.from(
      (await this.cache.stores.keys?.()) ?? [],
    ) as unknown as string[];
    await Promise.all(
      keys
        .filter((k) => k.startsWith('tasks_list_'))
        .map((k) => this.cache.del(k)),
    );
  }

  // ── Read ─────────────────────────────────────────────────────────────
  async findAll(
    query: PaginationQueryDto,
    projectId?: string,
    status?: string,
  ) {
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
      where,
      order: { [sortField]: order.toUpperCase() as 'ASC' | 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const result = {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    await this.cache.set(key, result);
    return result;
  }

  async findOne(id: string): Promise<Task> {
    const key = this.taskKey(id);
    const cached = await this.cache.get<Task>(key);
    if (cached) return cached;

    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task #${id} not found`);

    await this.cache.set(key, task);
    return task;
  }

  // ── Write ─────────────────────────────────────────────────────────────
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const saved = await this.taskRepository.save(createTaskDto);
    await this.invalidateTaskCaches();
    return saved;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    const saved = await this.taskRepository.save(task);
    await this.invalidateTaskCaches(id);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
    await this.invalidateTaskCaches(id);
  }
}