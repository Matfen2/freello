import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto, UpdateProjectDto, PaginationQueryDto } from '@freello/api-types';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
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