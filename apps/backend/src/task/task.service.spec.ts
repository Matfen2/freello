import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { OutboxEvent } from '../outbox/outbox-event.entity';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockTask = {
  id: 'task-uuid-123',
  title: 'Implémenter login',
  description: 'Créer le formulaire de connexion',
  status: 'todo',
  estimation: 3,
  projectId: 'project-uuid-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} as Task;

const mockTaskRepository = {
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

const mockTaskManagerRepo = {
  save: jest.fn(),
  remove: jest.fn(),
};

const mockOutboxManagerRepo = {
  save: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    jest.clearAllMocks();
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('retourne le résultat depuis le cache si disponible', async () => {
      const cached = { data: [mockTask], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
      mockCacheManager.get.mockResolvedValue(cached);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual(cached);
      expect(mockTaskRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('interroge la BDD et met en cache si cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockTaskRepository.findAndCount.mockResolvedValue([[mockTask], 1]);

      const result = await service.findAll({ page: 1, limit: 20, sort: 'createdAt', order: 'desc' });

      expect(result).toEqual({
        data: [mockTask],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      });
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('filtre par projectId si fourni', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockTaskRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 20 }, 'project-uuid-123');

      expect(mockTaskRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { projectId: 'project-uuid-123' } }),
      );
    });

    it('filtre par status si fourni', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockTaskRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 20 }, undefined, 'in_progress');

      expect(mockTaskRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'in_progress' } }),
      );
    });

    it('ignore un champ sort non autorisé et utilise createdAt', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockTaskRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 20, sort: 'injected_field', order: 'asc' });

      expect(mockTaskRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { createdAt: 'ASC' } }),
      );
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('retourne la tâche depuis le cache si disponible', async () => {
      mockCacheManager.get.mockResolvedValue(mockTask);

      const result = await service.findOne('task-uuid-123');

      expect(result).toEqual(mockTask);
      expect(mockTaskRepository.findOne).not.toHaveBeenCalled();
    });

    it('interroge la BDD et met en cache si cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne('task-uuid-123');

      expect(result).toEqual(mockTask);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('lève NotFoundException si la tâche n\'existe pas', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('uuid-unknown')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('uuid-unknown')).rejects.toThrow('Task #uuid-unknown not found');
    });
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('crée la tâche et l\'outbox event dans une transaction atomique', async () => {
      mockDataSource.transaction.mockImplementation(async (cb: (manager: unknown) => Promise<Task>) => {
        const manager = {
          getRepository: (entity: unknown) => {
            if (entity === Task) return mockTaskManagerRepo;
            if (entity === OutboxEvent) return mockOutboxManagerRepo;
          },
        };
        return cb(manager);
      });
      mockTaskManagerRepo.save.mockResolvedValue(mockTask);
      mockOutboxManagerRepo.save.mockResolvedValue({});

      const dto = { title: 'Implémenter login', projectId: 'project-uuid-123', status: 'todo' as const };
      const result = await service.create(dto);

      expect(result).toEqual(mockTask);
      expect(mockOutboxManagerRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'task.created', aggregateType: 'task' }),
      );
      expect(mockCacheManager.del).toHaveBeenCalled();
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('met à jour la tâche et l\'outbox event dans une transaction', async () => {
      mockCacheManager.get.mockResolvedValue(mockTask);
      mockDataSource.transaction.mockImplementation(async (cb: (manager: unknown) => Promise<Task>) => {
        const manager = {
          getRepository: (entity: unknown) => {
            if (entity === Task) return mockTaskManagerRepo;
            if (entity === OutboxEvent) return mockOutboxManagerRepo;
          },
        };
        return cb(manager);
      });
      const updated = { ...mockTask, title: 'Login modifié' } as Task;
      mockTaskManagerRepo.save.mockResolvedValue(updated);
      mockOutboxManagerRepo.save.mockResolvedValue({});

      const result = await service.update('task-uuid-123', { title: 'Login modifié' });

      expect(result.title).toBe('Login modifié');
      expect(mockOutboxManagerRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'task.updated' }),
      );
    });

    it('lève NotFoundException si la tâche n\'existe pas', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.update('uuid-unknown', { title: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ─────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('supprime la tâche et émet l\'outbox event task.deleted', async () => {
      mockCacheManager.get.mockResolvedValue(mockTask);
      mockDataSource.transaction.mockImplementation(async (cb: (manager: unknown) => Promise<void>) => {
        const manager = {
          getRepository: (entity: unknown) => {
            if (entity === Task) return mockTaskManagerRepo;
            if (entity === OutboxEvent) return mockOutboxManagerRepo;
          },
        };
        return cb(manager);
      });
      mockOutboxManagerRepo.save.mockResolvedValue({});
      mockTaskManagerRepo.remove.mockResolvedValue(undefined);

      await expect(service.remove('task-uuid-123')).resolves.toBeUndefined();
      expect(mockOutboxManagerRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'task.deleted' }),
      );
    });

    it('lève NotFoundException si la tâche n\'existe pas', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('uuid-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});