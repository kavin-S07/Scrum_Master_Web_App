import pool from '../config/database';
import logger from '../utils/logger';

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        employee_id VARCHAR(20) UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'scrum_master', 'employee')),
        profile_image TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY,
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY,
        department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
        team_name VARCHAR(100) NOT NULL,
        scrum_master_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY,
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, employee_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        project_name VARCHAR(200) NOT NULL,
        project_code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        status VARCHAR(30) DEFAULT 'planning' CHECK (status IN ('planning','active','on_hold','completed','cancelled')),
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS project_teams (
        id UUID PRIMARY KEY,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        UNIQUE(project_id, team_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sprints (
        id UUID PRIMARY KEY,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        sprint_name VARCHAR(100) NOT NULL,
        goal TEXT,
        start_date DATE,
        end_date DATE,
        sprint_status VARCHAR(30) DEFAULT 'planned' CHECK (sprint_status IN ('planned','active','completed','cancelled')),
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY,
        sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(250) NOT NULL,
        description TEXT,
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
        status VARCHAR(30) DEFAULT 'todo' CHECK (status IN ('todo','in_progress','testing','completed','blocked')),
        story_points INT,
        due_date DATE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS task_assignments (
        id UUID PRIMARY KEY,
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_current BOOLEAN DEFAULT TRUE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS work_logs (
        id UUID PRIMARY KEY,
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        worked_hours NUMERIC(5,2) NOT NULL,
        description TEXT,
        log_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS standups (
        id UUID PRIMARY KEY,
        employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        yesterday_work TEXT,
        today_plan TEXT,
        blockers TEXT,
        standup_date DATE NOT NULL,
        UNIQUE(employee_id, standup_date)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id UUID PRIMARY KEY,
        employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
        leave_type VARCHAR(50) CHECK (leave_type IN ('medical','casual','annual','emergency','unpaid')),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
        approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS task_reassignments (
        id UUID PRIMARY KEY,
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        old_employee UUID REFERENCES users(id) ON DELETE SET NULL,
        new_employee UUID REFERENCES users(id) ON DELETE SET NULL,
        reason TEXT,
        reassigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
        reassigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(250),
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS employee_metrics (
        id UUID PRIMARY KEY,
        employee_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        total_tasks_assigned INT DEFAULT 0,
        total_tasks_completed INT DEFAULT 0,
        delayed_tasks INT DEFAULT 0,
        total_hours NUMERIC(10,2) DEFAULT 0,
        productivity_score NUMERIC(5,2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add missing updated_at columns to tables that need them
    await client.query(`ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await client.query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await client.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await client.query(`ALTER TABLE sprints ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await client.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);

    // Indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprint_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_task_assignments_employee ON task_assignments(employee_id);
      CREATE INDEX IF NOT EXISTS idx_task_assignments_current ON task_assignments(task_id, is_current);
      CREATE INDEX IF NOT EXISTS idx_work_logs_employee ON work_logs(employee_id);
      CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
      CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
      CREATE INDEX IF NOT EXISTS idx_standups_employee_date ON standups(employee_id, standup_date);
    `);

    await client.query('COMMIT');
    logger.info('✅ All tables created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Migration failed', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});