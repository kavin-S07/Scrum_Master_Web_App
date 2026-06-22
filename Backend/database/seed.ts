import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const adminHash = await bcrypt.hash('Admin@123', 10);
    const userHash = await bcrypt.hash('Password@123', 10);

    // Admin
    const adminId = uuidv4();
    await client.query(
      `INSERT INTO users (id, employee_id, first_name, last_name, email, password_hash, role)
       VALUES ($1, 'ADMIN-001', 'Super', 'Admin', 'admin@sprintflow.com', $2, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [adminId, adminHash]
    );

    // Scrum Master
    const smId = uuidv4();
    await client.query(
      `INSERT INTO users (id, employee_id, first_name, last_name, email, password_hash, role)
       VALUES ($1, 'SM-001', 'Raj', 'Kumar', 'raj.sm@sprintflow.com', $2, 'scrum_master')
       ON CONFLICT (email) DO NOTHING`,
      [smId, userHash]
    );

    // Employees
    const emp1Id = uuidv4();
    const emp2Id = uuidv4();
    const emp3Id = uuidv4();
    await client.query(
      `INSERT INTO users (id, employee_id, first_name, last_name, email, password_hash, role) VALUES
       ($1, 'EMP-001', 'Arun', 'Dev', 'arun@sprintflow.com', $4, 'employee'),
       ($2, 'EMP-002', 'Priya', 'Coder', 'priya@sprintflow.com', $4, 'employee'),
       ($3, 'EMP-003', 'Kiran', 'Tester', 'kiran@sprintflow.com', $4, 'employee')
       ON CONFLICT (email) DO NOTHING`,
      [emp1Id, emp2Id, emp3Id, userHash]
    );

    // Department
    const deptId = uuidv4();
    await client.query(
      `INSERT INTO departments (id, name, description) VALUES ($1, 'Development', 'Core dev team')
       ON CONFLICT (name) DO NOTHING`,
      [deptId]
    );

    // Team
    const teamId = uuidv4();
    await client.query(
      `INSERT INTO teams (id, department_id, team_name, scrum_master_id) VALUES ($1, $2, 'Alpha Team', $3)`,
      [teamId, deptId, smId]
    );

    // Add team members
    for (const empId of [emp1Id, emp2Id, emp3Id]) {
      await client.query(
        `INSERT INTO team_members (id, team_id, employee_id) VALUES ($1, $2, $3)`,
        [uuidv4(), teamId, empId]
      );
      await client.query(
        `INSERT INTO employee_metrics (id, employee_id) VALUES ($1, $2) ON CONFLICT (employee_id) DO NOTHING`,
        [uuidv4(), empId]
      );
    }

    // Project
    const projId = uuidv4();
    await client.query(
      `INSERT INTO projects (id, project_name, project_code, description, start_date, end_date, status, created_by)
       VALUES ($1, 'SprintFlow Platform', 'SF-001', 'Main product development', CURRENT_DATE, CURRENT_DATE + 90, 'active', $2)`,
      [projId, adminId]
    );

    await client.query(
      `INSERT INTO project_teams (id, project_id, team_id) VALUES ($1, $2, $3)`,
      [uuidv4(), projId, teamId]
    );

    // Sprint
    const sprintId = uuidv4();
    await client.query(
      `INSERT INTO sprints (id, project_id, sprint_name, goal, start_date, end_date, sprint_status, created_by)
       VALUES ($1, $2, 'Sprint 1', 'Setup core authentication and user management', CURRENT_DATE, CURRENT_DATE + 14, 'active', $3)`,
      [sprintId, projId, smId]
    );

    // More demo projects with different statuses
    const extraProjects = [
      { name: 'Mobile App MVP', code: 'SF-002', desc: 'React Native mobile client', status: 'planning' },
      { name: 'Legacy Migration', code: 'SF-003', desc: 'Migrate monolith to microservices', status: 'active' },
      { name: 'Analytics Dashboard', code: 'SF-004', desc: 'Real-time analytics & reporting', status: 'completed' },
      { name: 'Q2 Research', code: 'SF-005', desc: 'Technology evaluation & POCs', status: 'on_hold' },
    ];
    for (const p of extraProjects) {
      const pid = uuidv4();
      await client.query(
        `INSERT INTO projects (id, project_name, project_code, description, start_date, end_date, status, created_by)
         VALUES ($1, $2, $3, $4, CURRENT_DATE, CURRENT_DATE + 60, $5, $6)`,
        [pid, p.name, p.code, p.desc, p.status, adminId]
      );
      await client.query(
        `INSERT INTO project_teams (id, project_id, team_id) VALUES ($1, $2, $3)`,
        [uuidv4(), pid, teamId]
      );
    }

    // Tasks
    const tasks = [
      { title: 'Setup JWT Authentication', priority: 'high', status: 'completed', sp: 5, emp: emp1Id },
      { title: 'Build User Registration API', priority: 'high', status: 'in_progress', sp: 3, emp: emp1Id },
      { title: 'Design Database Schema', priority: 'critical', status: 'completed', sp: 8, emp: emp2Id },
      { title: 'Task Management CRUD', priority: 'medium', status: 'todo', sp: 5, emp: emp2Id },
      { title: 'Write Unit Tests', priority: 'low', status: 'todo', sp: 3, emp: emp3Id },
    ];

    for (const t of tasks) {
      const taskId = uuidv4();
      await client.query(
        `INSERT INTO tasks (id, sprint_id, project_id, title, priority, status, story_points, due_date, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE + 10, $8)`,
        [taskId, sprintId, projId, t.title, t.priority, t.status, t.sp, smId]
      );
      await client.query(
        `INSERT INTO task_assignments (id, task_id, employee_id, assigned_by, is_current)
         VALUES ($1, $2, $3, $4, TRUE)`,
        [uuidv4(), taskId, t.emp, smId]
      );
    }

    await client.query('COMMIT');
    logger.info('✅ Seed data inserted successfully');
    logger.info('');
    logger.info('Login credentials:');
    logger.info('  Admin:        admin@sprintflow.com / Admin@123');
    logger.info('  Scrum Master: raj.sm@sprintflow.com / Password@123');
    logger.info('  Employee 1:   arun@sprintflow.com   / Password@123');
    logger.info('  Employee 2:   priya@sprintflow.com  / Password@123');
    logger.info('  Employee 3:   kiran@sprintflow.com  / Password@123');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Seeding failed', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});