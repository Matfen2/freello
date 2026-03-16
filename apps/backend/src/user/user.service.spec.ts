import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserRole } from './user.entity';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'uuid-123',
  email: 'test@freello.com',
  name: 'Test User',
  passwordHash: 'hashed_password',
  role: UserRole.USER,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} as User;

const mockUser2 = {
  id: 'uuid-456',
  email: 'other@freello.com',
  name: 'Other User',
  passwordHash: 'hashed_password_2',
  role: UserRole.USER,
  createdAt: new Date('2024-01-02'),
  updatedAt: new Date('2024-01-02'),
} as User;

const mockUserRepository = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('retourne les données paginées avec meta', async () => {
      mockUserRepository.findAndCount.mockResolvedValue([[mockUser, mockUser2], 2]);

      const result = await service.findAll({ page: 1, limit: 20, sort: 'createdAt', order: 'desc' });

      expect(result).toEqual({
        data: [mockUser, mockUser2],
        meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
      });
      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('utilise les valeurs par défaut si query est vide', async () => {
      mockUserRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({});

      expect(result.meta).toEqual({ total: 0, page: 1, limit: 20, totalPages: 0 });
    });

    it('ignore un champ sort non autorisé et utilise createdAt', async () => {
      mockUserRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 10, sort: 'malicious_field', order: 'asc' });

      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { createdAt: 'ASC' } }),
      );
    });

    it('calcule correctement totalPages', async () => {
      mockUserRepository.findAndCount.mockResolvedValue([[mockUser], 45]);

      const result = await service.findAll({ page: 2, limit: 20 });

      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.page).toBe(2);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('retourne l\'utilisateur si trouvé', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('uuid-123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
    });

    it('lève NotFoundException si l\'utilisateur n\'existe pas', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('uuid-unknown')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('uuid-unknown')).rejects.toThrow('User #uuid-unknown not found');
    });
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('sauvegarde et retourne le nouvel utilisateur', async () => {
      mockUserRepository.save.mockResolvedValue(mockUser);

      const dto = { email: 'test@freello.com', name: 'Test User' };
      const result = await service.create(dto);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(dto);
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('met à jour et retourne l\'utilisateur modifié', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' } as User;
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('uuid-123', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('lève NotFoundException si l\'utilisateur n\'existe pas', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('uuid-unknown', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ─────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('supprime l\'utilisateur sans retourner de valeur', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove('uuid-123')).resolves.toBeUndefined();
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('lève NotFoundException si l\'utilisateur n\'existe pas', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('uuid-unknown')).rejects.toThrow(NotFoundException);
    });
  });
});