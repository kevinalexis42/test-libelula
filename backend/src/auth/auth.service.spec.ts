import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}));

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
};

const mockJwt = {
  sign: vi.fn(),
};

const storedUser = {
  id: 'user-uuid-123',
  email: 'user@example.com',
  password: '$2a$10$hashedpassword',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(mockPrisma as any, mockJwt as any);
    vi.clearAllMocks();
    mockJwt.sign.mockReturnValue('signed.jwt.token');
  });

  describe('login', () => {
    it('returns accessToken and tokenType on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(storedUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({
        email: 'user@example.com',
        password: 'Password123!',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.tokenType).toBe('Bearer');
    });

    it('signs the JWT with the user id and email as payload', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(storedUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await service.login({ email: 'user@example.com', password: 'Password123!' });

      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: storedUser.id, email: storedUser.email }),
      );
    });

    it('throws UnauthorizedException when no user matches the email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(storedUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'user@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('never calls jwt.sign when credentials are invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'Password123!' }),
      ).rejects.toThrow();

      expect(mockJwt.sign).not.toHaveBeenCalled();
    });
  });
});
