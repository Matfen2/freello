import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Project } from './project.entity';
import { Task } from '../task/task.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import {
  CreateProjectDto,
  UpdateProjectDto,
  PaginationQueryDto,
  CreateProjectWithTasksDto,
} from '@freello/api-types';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  // ── Helpers ──────────────────────────────────────────────────────────
  private projectListKey(query: PaginationQueryDto): string {
    return `projects_list_${query.page}_${query.limit}_${query.sort}_${query.order}`;
  }

  private projectKey(id: string): string {
    return `project_${id}`;
  }

  private async invalidateProjectCaches(id?: string): Promise<void> {
    if (id) await this.cache.del(this.projectKey(id));
    const keys = Array.from(
      (await this.cache.stores.keys?.()) ?? []
    ) as unknown as string[];
    await Promise.all(
      keys
        .filter((k) => k.startsWith('projects_list_'))
        .map((k) => this.cache.del(k)),
    );
  }

  // ── Read ─────────────────────────────────────────────────────────────
  async findAll(query: PaginationQueryDto) {
    const key = this.projectListKey(query);
    const cached = await this.cache.get(key);
    if (cached) return cached;

    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;
    const allowedSort = ['createdAt', 'updatedAt', 'name'];
    const sortField = allowedSort.includes(sort) ? sort : 'createdAt';

    const [data, total] = await this.projectRepository.findAndCount({
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

  async findOne(id: string): Promise<Project> {
    const key = this.projectKey(id);
    const cached = await this.cache.get<Project>(key);
    if (cached) return cached;

    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project #${id} not found`);

    await this.cache.set(key, project);
    return project;
  }

  // ── Write ─────────────────────────────────────────────────────────────
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const saved = await this.projectRepository.save(createProjectDto);
    await this.invalidateProjectCaches();
    return saved;
  }

  async createWithTasks(dto: CreateProjectWithTasksDto) {
    const result = await this.dataSource.transaction(async (manager) => {
      const project = manager.getRepository(Project).create({
        name: dto.name,
        description: dto.description,
      });
      const savedProject = await manager.getRepository(Project).save(project);

      const tasks = await Promise.all(
        dto.tasks.map((taskDto) => {
          const task = manager.getRepository(Task).create({
            title: taskDto.title,
            description: taskDto.description,
            status: taskDto.status ?? 'todo',
            projectId: savedProject.id,
          });
          return manager.getRepository(Task).save(task);
        }),
      );

      return { project: savedProject, tasks };
    });

    await this.invalidateProjectCaches();
    return result;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    const saved = await this.projectRepository.save(project);
    await this.invalidateProjectCaches(id);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
    await this.invalidateProjectCaches(id);
  }
}