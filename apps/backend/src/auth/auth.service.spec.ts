import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../user/user.entity';
import { UserRole } from '../user/user.entity';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'uuid-123',
  email: 'test@freello.com',
  name: 'Test User',           
  passwordHash: 'hashed_password', 
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── validateUser ───────────────────────────────────────────────────────────

  describe('validateUser()', () => {
    it('retourne l\'utilisateur si les credentials sont valides', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('test@freello.com', 'password');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@freello.com' },
        select: expect.arrayContaining(['id', 'email', 'passwordHash', 'role']),
        });
    });

    it('lève UnauthorizedException si l\'utilisateur n\'existe pas', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser('unknown@freello.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lève UnauthorizedException si le mot de passe est incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.validateUser('test@freello.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('retourne un accessToken signé', async () => {
      const result = await service.login(mockUser);

      expect(result).toEqual({ accessToken: 'mock.jwt.token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  // ── register ───────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('crée un utilisateur et retourne son id et email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@freello.com',
        password: 'Test1234!',
      });

      expect(result).toEqual({ id: mockUser.id, email: mockUser.email });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('lève ConflictException si l\'email est déjà utilisé', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@freello.com', password: 'Test1234!' }),
      ).rejects.toThrow(ConflictException);
    });

    it('hash le mot de passe avant de sauvegarder', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      await service.register({ email: 'new@freello.com', password: 'Test1234!' });

      expect(hashSpy).toHaveBeenCalledWith('Test1234!', expect.any(Number));
    });
  });
});