import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto, PaginationQueryDto } from '@freello/api-types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;

    const allowedSort = ['createdAt', 'updatedAt', 'name', 'email'];
    const sortField = allowedSort.includes(sort) ? sort : 'createdAt';

    const [data, total] = await this.userRepository.findAndCount({
      order: { [sortField]: order.toUpperCase() as 'ASC' | 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.save(createUserDto);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}