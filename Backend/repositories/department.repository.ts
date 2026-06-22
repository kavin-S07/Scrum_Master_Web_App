import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { buildUpdateSet } from '../utils/sql';

const UPDATABLE_DEPARTMENT_FIELDS = ['name', 'description'] as const;

export const departmentRepository = {
  async findAll() {
    const result = await query('SELECT * FROM departments ORDER BY name');
    return result.rows;
  },

  async findById(id: string) {
    const result = await query('SELECT * FROM departments WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(name: string, description?: string) {
    const result = await query(
      'INSERT INTO departments (id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [uuidv4(), name, description || null]
    );
    return result.rows[0];
  },

  async update(id: string, data: Partial<{ name: string; description: string }>) {
    const { setClause, values } = buildUpdateSet(data, UPDATABLE_DEPARTMENT_FIELDS, 2);
    const result = await query(
      `UPDATE departments SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  },

  async delete(id: string) {
    await query('DELETE FROM departments WHERE id = $1', [id]);
  },
};