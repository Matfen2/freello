import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Project } from './project.entity';
import { Task } from '../task/task.entity';
import { CreateProjectDto, UpdateProjectDto, PaginationQueryDto, CreateProjectWithTasksDto } from '@freello/api-types';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;

    const allowedSort = ['createdAt', 'updatedAt', 'name'];
    const sortField = allowedSort.includes(sort) ? sort : 'createdAt';

    const [data, total] = await this.projectRepository.findAndCount({
      order: { [sortField]: order.toUpperCase() as 'ASC' | 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project #${id} not found`);
    return project;
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectRepository.save(createProjectDto);
  }

  async createWithTasks(dto: CreateProjectWithTasksDto) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Créer et sauvegarder le projet
      const project = manager.getRepository(Project).create({
        name: dto.name,
        description: dto.description,
      });
      const savedProject = await manager.getRepository(Project).save(project);

      // 2. Créer et sauvegarder toutes les tâches
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
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }
}