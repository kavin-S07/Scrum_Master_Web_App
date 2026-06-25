
export interface User {
  id: string;
  employee_id?: string;
  first_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'scrum_master' | 'employee';
  profile_image?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
export interface RegisterRequest {
  first_name: string; email: string; password: string;
  phone?: string; role?: 'employee' | 'scrum_master';
}

// ─── Department ───────────────────────────────────────────────────────────────

export interface Department {
  id: string; name: string; description?: string; created_at: string;
}
export interface DepartmentRequest { name: string; description?: string; }

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface Team {
  id: string; team_name: string; department_id?: string;
  scrum_master_id?: string; created_at: string;
  department_name?: string; scrum_master_name?: string;
}
export interface TeamMember {
  id: string; team_id: string; employee_id: string; joined_at: string;
  first_name: string; email: string; role: string;
}
export interface TeamRequest {
  department_id: string; team_name: string; scrum_master_id: string;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export interface Project {
  id: string; project_name: string; project_code: string; description?: string;
  start_date: string; end_date: string; status: ProjectStatus;
  created_by: string; created_at: string;
  created_by_name?: string;
  total_sprints?: number; total_teams?: number;
}
export interface ProjectRequest {
  project_name: string; project_code: string; description?: string;
  start_date: string; end_date: string; status?: ProjectStatus;
}

// ─── Sprint ───────────────────────────────────────────────────────────────────

export type SprintStatus = 'planned' | 'active' | 'completed' | 'cancelled';
export interface Sprint {
  id: string; project_id: string; sprint_name: string; goal?: string;
  start_date: string; end_date: string; sprint_status: SprintStatus;
  created_by: string; created_at: string;
}
export interface SprintRequest {
  project_id: string; sprint_name: string; goal?: string;
  start_date: string; end_date: string; sprint_status?: SprintStatus;
}
export interface BurndownData {
  sprint: { id: string; sprint_name: string; start_date: string; end_date: string; total_story_points: number; };
  burndown: { date: string; remaining_points: number; }[];
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'testing' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export interface Task {
  id: string; title: string; description?: string;
  priority: TaskPriority; status: TaskStatus;
  story_points?: number; due_date?: string;
  project_id: string; project_name?: string;
  sprint_id?: string; sprint_name?: string;
  assigned_to_id?: string; assigned_to_name?: string;
  created_by: string; created_by_name?: string; created_at: string;
}
export interface TaskRequest {
  project_id: string; sprint_id?: string; title: string; description?: string;
  priority?: TaskPriority; status?: TaskStatus; story_points?: number; due_date?: string;
}
export interface TaskAssignmentHistory {
  id: string; task_id: string; employee_id: string; employee_name: string;
  assigned_by: string; assigned_by_name: string; assigned_at: string; is_current: boolean;
}

// ─── Work Log ─────────────────────────────────────────────────────────────────

export interface WorkLog {
  id: string; task_id: string; employee_id: string; employee_name?: string;
  task_title?: string; project_name?: string;
  worked_hours: number; description: string; log_date: string; created_at: string;
}
export interface WorkLogRequest {
  task_id: string; worked_hours: number; description: string; log_date: string;
}

// ─── Standup ──────────────────────────────────────────────────────────────────

export interface Standup {
  id: string; employee_id: string; employee_name?: string; emp_code?: string;
  yesterday_work: string; today_plan: string; blockers?: string; standup_date: string;
}
export interface StandupRequest {
  yesterday_work: string; today_plan: string; blockers?: string; standup_date: string;
}

// ─── Leave ────────────────────────────────────────────────────────────────────

export type LeaveType = 'medical' | 'casual' | 'annual' | 'emergency' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export interface LeaveRequest {
  id: string; employee_id: string; employee_name?: string; emp_code?: string;
  leave_type: LeaveType; start_date: string; end_date: string;
  reason: string; status: LeaveStatus;
  approved_by?: string; approved_by_name?: string; created_at: string;
}
export interface LeaveRequestBody {
  leave_type: LeaveType; start_date: string; end_date: string; reason: string;
}
export interface LeaveDecisionBody { status: 'approved' | 'rejected'; remarks?: string; }

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string; user_id: string; title: string; message: string;
  is_read: boolean; created_at: string;
}

// ─── Reassignment ─────────────────────────────────────────────────────────────

export interface Reassignment {
  id: string; task_id: string; task_title?: string;
  old_employee: string; old_employee_name?: string;
  new_employee: string; new_employee_name?: string;
  reason: string; reassigned_by: string; reassigned_by_name?: string;
  reassigned_at: string;
}
export interface ReassignmentRequest {
  task_id: string; new_employee_id: string; reason: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface AdminDashboard {
  overview: {
    total_employees: number; total_teams: number; total_projects: number;
    active_sprints: number; pending_leaves: number; total_tasks: number;
    completed_tasks: number; blocked_tasks: number; delayed_tasks: number;
  };
  projects_by_status: { status: string; count: string }[];
  top_performers: { name: string; productivity_score: string; total_tasks_completed: number }[];
}
export interface ScrumMasterDashboard {
  active_sprints: { id: string; sprint_name: string; end_date: string; total_tasks: number; completed_tasks: number; progress_percent: string }[];
  task_overview: { total_tasks: number; blocked_tasks: number; overdue_tasks: number };
  pending_leaves: { id: string; employee_name: string; leave_type: string; start_date: string; end_date: string }[];
  blocked_tasks: { id: string; title: string; assigned_to: string }[];
}
export interface EmployeeDashboard {
  pending_tasks: Task[];
  today_tasks: Task[];
  completed_tasks_count: number;
  recent_leaves: LeaveRequest[];
  work_hours_this_month: string;
  sprint_progress: { sprint_name: string; end_date: string; total_tasks: number; completed_tasks: number }[];
}
export interface TeamProductivity {
  id: string; name: string; total_tasks: number;
  completed_tasks: number; overdue_tasks: number; total_hours: string;
}

// ─── API Wrappers ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean; message: string; data: T;
}
export interface PaginatedResponse<T> {
  success: boolean; message: string; data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
export interface NotificationsResponse {
  notifications: Notification[]; total: number; unread: number;
}