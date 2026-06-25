import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUserDto {
  first_name: string;
  email: string;
  password_hash: string;
  phone?: string;
  role: string;
}

export interface UserRow {
  id: string;
  employee_id: string;
  first_name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  role: 'admin' | 'scrum_master' | 'employee';
  profile_image: string | null;
  is_active: boolean;
  created_at: Date;
}

export const authRepository = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await query<UserRow>('SELECT * FROM users WHERE email = $1', [
      email.toLowerCase().trim(),
    ]);
    return result.rows[0] || null;
  },

  /** Returns public profile (no password_hash). */
  async findById(id: string) {
    const result = await query(
      'SELECT id, employee_id, first_name, email, phone, role, profile_image, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /** Returns full row including password_hash — only use for auth checks. */
  async findByIdWithPassword(id: string): Promise<UserRow | null> {
    const result = await query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(data: CreateUserDto) {
    const id = uuidv4();
    const empId = `EMP-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;
    const result = await query(
      `INSERT INTO users (id, employee_id, first_name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, employee_id, first_name, email, phone, role, is_active, created_at`,
      [id, empId, data.first_name, data.email.toLowerCase().trim(),
       data.password_hash, data.phone || null, data.role]
    );
    return result.rows[0];
  },

  async updatePassword(id: string, password_hash: string) {
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      password_hash,
      id,
    ]);
  },

  async updateRole(id: string, role: 'admin' | 'scrum_master' | 'employee') {
    const result = await query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, employee_id, first_name, email, phone, role, is_active, created_at`,
      [role, id]
    );
    return result.rows[0] || null;
  },

  /** `tokenHash` is the SHA-256 hash of the refresh JWT — never the raw token. */
  async storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    await query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET token = $3, expires_at = $4`,
      [uuidv4(), userId, tokenHash, expiresAt]
    );
  },

  async findRefreshTokenByHash(tokenHash: string) {
    const result = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [tokenHash]
    );
    return result.rows[0] || null;
  },

  async deleteRefreshToken(userId: string) {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  },
};
