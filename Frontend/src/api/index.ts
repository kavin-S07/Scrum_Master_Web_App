
import api from './client';
import type {
  LoginRequest, LoginResponse, RegisterRequest, User,
  Department, DepartmentRequest,
  Team, TeamMember, TeamRequest,
  Project, ProjectRequest, ProjectStatus,
  Sprint, SprintRequest, BurndownData,
  Task, TaskRequest, TaskAssignmentHistory, TaskStatus, TaskPriority,
  WorkLog, WorkLogRequest,
  Standup, StandupRequest,
  LeaveRequest, LeaveRequestBody, LeaveDecisionBody, LeaveStatus,
  NotificationsResponse,
  Reassignment, ReassignmentRequest,
  AdminDashboard, ScrumMasterDashboard, EmployeeDashboard, TeamProductivity,
  ApiResponse, PaginatedResponse,
} from '../types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginRequest) => api.post<ApiResponse<LoginResponse>>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<ApiResponse<User>>('/auth/register', data),
  logout: () => api.post<ApiResponse<null>>('/auth/logout'),
  refresh: (refresh_token: string) => api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refresh_token }),
  profile: () => api.get<ApiResponse<User>>('/auth/profile'),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put<ApiResponse<null>>('/auth/change-password', data),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (params?: { page?: number; limit?: number; role?: string }) =>
    api.get<PaginatedResponse<User>>('/users', { params }),
  get: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  update: (id: string, data: Partial<User>) => api.put<ApiResponse<User>>(`/users/${id}`, data),
  deactivate: (id: string) => api.patch<ApiResponse<null>>(`/users/${id}/deactivate`),
  activate: (id: string) => api.patch<ApiResponse<null>>(`/users/${id}/activate`),
};

// ─── Departments ──────────────────────────────────────────────────────────────

export const departmentsApi = {
  list: () => api.get<ApiResponse<Department[]>>('/departments'),
  get: (id: string) => api.get<ApiResponse<Department>>(`/departments/${id}`),
  create: (data: DepartmentRequest) => api.post<ApiResponse<Department>>('/departments', data),
  update: (id: string, data: DepartmentRequest) => api.put<ApiResponse<Department>>(`/departments/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/departments/${id}`),
};

// ─── Teams ────────────────────────────────────────────────────────────────────

export const teamsApi = {
  list: (params?: { department_id?: string; scrum_master_id?: string }) => api.get<ApiResponse<Team[]>>('/teams', { params }),
  get: (id: string) => api.get<ApiResponse<Team>>(`/teams/${id}`),
  create: (data: TeamRequest) => api.post<ApiResponse<Team>>('/teams', data),
  update: (id: string, data: Partial<TeamRequest>) => api.put<ApiResponse<Team>>(`/teams/${id}`, data),
  members: (id: string) => api.get<ApiResponse<TeamMember[]>>(`/teams/${id}/members`),
  addMember: (id: string, employee_id: string) => api.post<ApiResponse<null>>(`/teams/${id}/members`, { employee_id }),
  removeMember: (id: string, employeeId: string) => api.delete<ApiResponse<null>>(`/teams/${id}/members/${employeeId}`),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: (params?: { page?: number; limit?: number; status?: ProjectStatus }) =>
    api.get<PaginatedResponse<Project>>('/projects', { params }),
  get: (id: string) => api.get<ApiResponse<Project>>(`/projects/${id}`),
  create: (data: ProjectRequest) => api.post<ApiResponse<Project>>('/projects', data),
  update: (id: string, data: Partial<ProjectRequest>) => api.put<ApiResponse<Project>>(`/projects/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/projects/${id}`),
  assignTeam: (id: string, team_id: string) => api.post<ApiResponse<null>>(`/projects/${id}/teams`, { team_id }),
  removeTeam: (id: string, teamId: string) => api.delete<ApiResponse<null>>(`/projects/${id}/teams/${teamId}`),
  teams: (id: string) => api.get<ApiResponse<Team[]>>(`/projects/${id}/teams`),
};

// ─── Sprints ──────────────────────────────────────────────────────────────────

export const sprintsApi = {
  listByProject: (projectId: string) => api.get<ApiResponse<Sprint[]>>(`/projects/${projectId}/sprints`),
  get: (id: string) => api.get<ApiResponse<Sprint>>(`/sprints/${id}`),
  create: (data: SprintRequest) => api.post<ApiResponse<Sprint>>('/sprints', data),
  update: (id: string, data: Partial<SprintRequest>) => api.put<ApiResponse<Sprint>>(`/sprints/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/sprints/${id}`),
  burndown: (id: string) => api.get<ApiResponse<BurndownData>>(`/sprints/${id}/burndown`),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasksApi = {
  list: (params?: { page?: number; limit?: number; sprint_id?: string; project_id?: string; employee_id?: string; status?: TaskStatus; priority?: TaskPriority }) =>
    api.get<PaginatedResponse<Task>>('/tasks', { params }),
  get: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),
  create: (data: TaskRequest) => api.post<ApiResponse<Task>>('/tasks', data),
  update: (id: string, data: Partial<TaskRequest> & { status?: TaskStatus }) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/tasks/${id}`),
  assign: (id: string, employee_id: string) => api.post<ApiResponse<null>>(`/tasks/${id}/assign`, { employee_id }),
  updateStatus: (id: string, status: TaskStatus) => api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status }),
  history: (id: string) => api.get<ApiResponse<TaskAssignmentHistory[]>>(`/tasks/${id}/history`),
};

// ─── Work Logs ────────────────────────────────────────────────────────────────

export const workLogsApi = {
  create: (data: WorkLogRequest) => api.post<ApiResponse<WorkLog>>('/work-logs', data),
  byTask: (taskId: string) => api.get<ApiResponse<WorkLog[]>>(`/work-logs/task/${taskId}`),
  byEmployee: (employeeId: string, params?: { start_date?: string; end_date?: string }) =>
    api.get<ApiResponse<WorkLog[]>>(`/work-logs/employee/${employeeId}`, { params }),
  my: (params?: { start_date?: string; end_date?: string }) =>
    api.get<ApiResponse<WorkLog[]>>('/work-logs/my', { params }),
};

// ─── Standups ─────────────────────────────────────────────────────────────────

export const standupsApi = {
  submit: (data: StandupRequest) => api.post<ApiResponse<Standup>>('/standups', data),
  byTeam: (teamId: string, date?: string) =>
    api.get<ApiResponse<Standup[]>>(`/standups/team/${teamId}`, { params: date ? { date } : undefined }),
  my: () => api.get<ApiResponse<Standup[]>>('/standups/my'),
};

// ─── Leaves ───────────────────────────────────────────────────────────────────

export const leavesApi = {
  create: (data: LeaveRequestBody) => api.post<ApiResponse<LeaveRequest>>('/leaves', data),
  list: (params?: { page?: number; limit?: number; status?: LeaveStatus; employee_id?: string }) =>
    api.get<PaginatedResponse<LeaveRequest>>('/leaves', { params }),
  get: (id: string) => api.get<ApiResponse<LeaveRequest>>(`/leaves/${id}`),
  decision: (id: string, data: LeaveDecisionBody) => api.patch<ApiResponse<LeaveRequest>>(`/leaves/${id}/decision`, data),
  cancel: (id: string) => api.patch<ApiResponse<null>>(`/leaves/${id}/cancel`),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (page?: number) => api.get<ApiResponse<NotificationsResponse>>('/notifications', { params: page ? { page } : undefined }),
  markRead: (id: string) => api.patch<ApiResponse<null>>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<ApiResponse<null>>('/notifications/read-all'),
};

// ─── Reassignments ────────────────────────────────────────────────────────────

export const reassignmentsApi = {
  create: (data: ReassignmentRequest) => api.post<ApiResponse<Task>>('/reassignments', data),
  list: (params?: { task_id?: string; employee_id?: string }) =>
    api.get<ApiResponse<Reassignment[]>>('/reassignments', { params }),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  admin: () => api.get<ApiResponse<AdminDashboard>>('/dashboard/admin'),
  scrumMaster: () => api.get<ApiResponse<ScrumMasterDashboard>>('/dashboard/scrum-master'),
  employee: () => api.get<ApiResponse<EmployeeDashboard>>('/dashboard/employee'),
  teamProductivity: (teamId: string) => api.get<ApiResponse<TeamProductivity[]>>(`/dashboard/team/${teamId}/productivity`),
};