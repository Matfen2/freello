import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { ProjectService } from './project.service';
import { Project } from './project.entity';
import { Task } from '../task/task.entity';
import type { CreateProjectWithTasksDto } from '@freello/api-types';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockProject = {
  id: 'project-uuid-123',
  name: 'Freello',
  description: 'Trello-inspired project manager',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} as Project;

const mockProjectRepository = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockProjectManagerRepo = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockTaskManagerRepo = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: getRepositoryToken(Project), useValue: mockProjectRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    jest.clearAllMocks();
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('retourne le résultat depuis le cache si disponible', async () => {
      const cached = { data: [mockProject], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
      mockCacheManager.get.mockResolvedValue(cached);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual(cached);
      expect(mockProjectRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('interroge la BDD et met en cache si cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockProjectRepository.findAndCount.mockResolvedValue([[mockProject], 1]);

      const result = await service.findAll({ page: 1, limit: 20, sort: 'createdAt', order: 'desc' });

      expect(result).toEqual({
        data: [mockProject],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('ignore un champ sort non autorisé et utilise createdAt', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockProjectRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 20, sort: 'injected_field', order: 'asc' });

      expect(mockProjectRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { createdAt: 'ASC' } }),
      );
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('retourne le projet depuis le cache si disponible', async () => {
      mockCacheManager.get.mockResolvedValue(mockProject);

      const result = await service.findOne('project-uuid-123');

      expect(result).toEqual(mockProject);
      expect(mockProjectRepository.findOne).not.toHaveBeenCalled();
    });

    it('interroge la BDD et met en cache si cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockProjectRepository.findOne.mockResolvedValue(mockProject);

      const result = await service.findOne('project-uuid-123');

      expect(result).toEqual(mockProject);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('lève NotFoundException si le projet n\'existe pas', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('uuid-unknown')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('uuid-unknown')).rejects.toThrow('Project #uuid-unknown not found');
    });
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('sauvegarde et retourne le projet créé', async () => {
      mockProjectRepository.save.mockResolvedValue(mockProject);

      const dto = { name: 'Freello', description: 'Trello-inspired project manager' };
      const result = await service.create(dto);

      expect(result).toEqual(mockProject);
      expect(mockProjectRepository.save).toHaveBeenCalledWith(dto);
      expect(mockCacheManager.del).toHaveBeenCalled();
    });
  });

  // ── createWithTasks ────────────────────────────────────────────────────────

  describe('createWithTasks()', () => {
    it('crée le projet et ses tâches dans une transaction atomique', async () => {
      const mockTask = { id: 'task-uuid-1', title: 'Setup DB', projectId: 'project-uuid-123' } as Task;

      mockDataSource.transaction.mockImplementation(async (cb: (manager: unknown) => Promise<unknown>) => {
        const manager = {
          getRepository: (entity: unknown) => {
            if (entity === Project) return mockProjectManagerRepo;
            if (entity === Task) return mockTaskManagerRepo;
          },
        };
        return cb(manager);
      });

      mockProjectManagerRepo.create.mockReturnValue(mockProject);
      mockProjectManagerRepo.save.mockResolvedValue(mockProject);
      mockTaskManagerRepo.create.mockReturnValue(mockTask);
      mockTaskManagerRepo.save.mockResolvedValue(mockTask);

      const dto = {
        name: 'Freello',
        tasks: [{ title: 'Setup DB', status: 'todo' }],
      } as CreateProjectWithTasksDto;

      const result = await service.createWithTasks(dto);

      expect(result.project).toEqual(mockProject);
      expect(result.tasks).toHaveLength(1);
      expect(mockTaskManagerRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('met à jour et retourne le projet modifié', async () => {
      const updated = { ...mockProject, name: 'Freello v2' } as Project;
      mockCacheManager.get.mockResolvedValue({ ...mockProject });
      mockProjectRepository.save.mockResolvedValue(updated);

      const result = await service.update('project-uuid-123', { name: 'Freello v2' });

      expect(result.name).toBe('Freello v2');
      expect(mockCacheManager.del).toHaveBeenCalledWith('project_project-uuid-123');
    });

    it('lève NotFoundException si le projet n\'existe pas', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(service.update('uuid-unknown', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ─────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('supprime le projet et invalide le cache', async () => {
      mockCacheManager.get.mockResolvedValue(mockProject);
      mockProjectRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove('project-uuid-123')).resolves.toBeUndefined();
      expect(mockProjectRepository.remove).toHaveBeenCalledWith(mockProject);
      expect(mockCacheManager.del).toHaveBeenCalledWith('project_project-uuid-123');
    });

    it('lève NotFoundException si le projet n\'existe pas', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('uuid-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});