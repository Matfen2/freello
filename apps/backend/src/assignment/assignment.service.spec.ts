import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { Assignment } from './assignment.entity';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockAssignment = {
  id: 'assignment-uuid-123',
  userId: 'user-uuid-123',
  taskId: 'task-uuid-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} as Assignment;

const mockAssignment2 = {
  id: 'assignment-uuid-456',
  userId: 'user-uuid-456',
  taskId: 'task-uuid-123',
  createdAt: new Date('2024-01-02'),
  updatedAt: new Date('2024-01-02'),
} as Assignment;

const mockAssignmentRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('AssignmentService', () => {
  let service: AssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        { provide: getRepositoryToken(Assignment), useValue: mockAssignmentRepository },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
    jest.clearAllMocks();
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('retourne tous les assignments triés par createdAt DESC', async () => {
      mockAssignmentRepository.find.mockResolvedValue([mockAssignment2, mockAssignment]);

      const result = await service.findAll();

      expect(result).toEqual([mockAssignment2, mockAssignment]);
      expect(mockAssignmentRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('retourne un tableau vide si aucun assignment', async () => {
      mockAssignmentRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('retourne l\'assignment si trouvé', async () => {
      mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);

      const result = await service.findOne('assignment-uuid-123');

      expect(result).toEqual(mockAssignment);
      expect(mockAssignmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'assignment-uuid-123' },
      });
    });

    it('lève NotFoundException si l\'assignment n\'existe pas', async () => {
      mockAssignmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('uuid-unknown')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('uuid-unknown')).rejects.toThrow(
        'Assignment #uuid-unknown not found',
      );
    });
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('sauvegarde et retourne le nouvel assignment', async () => {
      mockAssignmentRepository.save.mockResolvedValue(mockAssignment);

      const dto = { userId: 'user-uuid-123', taskId: 'task-uuid-123' };
      const result = await service.create(dto);

      expect(result).toEqual(mockAssignment);
      expect(mockAssignmentRepository.save).toHaveBeenCalledWith(dto);
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('met à jour et retourne l\'assignment modifié', async () => {
      const updated = { ...mockAssignment, taskId: 'task-uuid-999' } as Assignment;
      mockAssignmentRepository.findOne.mockResolvedValue({ ...mockAssignment });
      mockAssignmentRepository.save.mockResolvedValue(updated);

      const result = await service.update('assignment-uuid-123', { taskId: 'task-uuid-999' });

      expect(result.taskId).toBe('task-uuid-999');
      expect(mockAssignmentRepository.save).toHaveBeenCalled();
    });

    it('lève NotFoundException si l\'assignment n\'existe pas', async () => {
      mockAssignmentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('uuid-unknown', { taskId: 'task-uuid-999' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ─────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('supprime l\'assignment sans retourner de valeur', async () => {
      mockAssignmentRepository.findOne.mockResolvedValue(mockAssignment);
      mockAssignmentRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove('assignment-uuid-123')).resolves.toBeUndefined();
      expect(mockAssignmentRepository.remove).toHaveBeenCalledWith(mockAssignment);
    });

    it('lève NotFoundException si l\'assignment n\'existe pas', async () => {
      mockAssignmentRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('uuid-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});