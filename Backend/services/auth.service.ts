import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from '../repositories/auth.repository';
import { userRepository } from '../repositories/user.repository';
import { jwtConfig } from '../config/jwt';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { hashToken } from '../utils/crypto';

interface TokenSubject {
  id: string;
  email: string;
  role: string;
  employee_id: string;
}

const generateTokens = (user: TokenSubject) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, employee_id: user.employee_id },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

/** Refresh tokens are persisted for 30 days regardless of JWT_REFRESH_EXPIRES_IN
 *  display purposes; the JWT's own `exp` claim is still what's actually
 *  enforced on verify — this is just how long the DB record (used for
 *  revocation/rotation lookups) is kept around before it's eligible for cleanup. */
const REFRESH_TOKEN_RETENTION_DAYS = 30;

export const authService = {
  async register(data: {
    first_name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) {
    const existing = await authRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email already registered', 409);

    const password_hash = await bcrypt.hash(data.password, env.bcryptRounds);

    const user = await authRepository.create({ ...data, password_hash, role: data.role || 'employee' });

    // FIX: this was dead code in the original repository (defined, never
    // called), so new employees never got an employee_metrics row. Work
    // log hours and productivity scores for them would silently fail to
    // update until someone manually inserted one.
    await userRepository.initMetrics(user.id);

    return user;
  },

  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new AppError('Invalid email or password', 401);
    if (!user.is_active) throw new AppError('Account is deactivated', 401);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    const { accessToken, refreshToken } = generateTokens(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_RETENTION_DAYS);
    await authRepository.storeRefreshToken(user.id, hashToken(refreshToken), expiresAt);

    const { password_hash: _unused, ...userWithoutPassword } = user;
    void _unused;
    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  async refreshToken(token: string) {
    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, jwtConfig.refreshSecret) as { id: string };
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Look the token up by its hash — the DB never stores the raw value.
    const stored = await authRepository.findRefreshTokenByHash(hashToken(token));
    if (!stored) throw new AppError('Invalid or expired refresh token', 401);

    const user = await authRepository.findById(decoded.id);
    if (!user) throw new AppError('User not found', 404);

    // Rotate: delete the old token before issuing a new one.
    await authRepository.deleteRefreshToken(user.id);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      employee_id: user.employee_id,
    });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_RETENTION_DAYS);
    await authRepository.storeRefreshToken(user.id, hashToken(newRefreshToken), expiresAt);

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId: string) {
    await authRepository.deleteRefreshToken(userId);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await authRepository.findByIdWithPassword(userId);
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) throw new AppError('Current password is incorrect', 400);

    const hash = await bcrypt.hash(newPassword, env.bcryptRounds);
    await authRepository.updatePassword(userId, hash);

    // Invalidate existing refresh tokens on password change so a stolen
    // session can't outlive a password reset.
    await authRepository.deleteRefreshToken(userId);
  },

  async getProfile(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  },
};