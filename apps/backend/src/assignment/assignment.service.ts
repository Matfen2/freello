import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './assignment.entity';
import { CreateAssignmentDto, UpdateAssignmentDto } from '@freello/api-types';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
  ) {}

  async findAll(): Promise<Assignment[]> {
    return this.assignmentRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({ where: { id } });
    if (!assignment) throw new NotFoundException(`Assignment #${id} not found`);
    return assignment;
  }

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    return this.assignmentRepository.save(createAssignmentDto);
  }

  async update(
    id: string,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    const assignment = await this.findOne(id);
    Object.assign(assignment, updateAssignmentDto);
    return this.assignmentRepository.save(assignment);
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.findOne(id);
    await this.assignmentRepository.remove(assignment);
  }
}