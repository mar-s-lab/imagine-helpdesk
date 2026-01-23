export type TicketType = 'fixed_scope' | 'bug_report' | 'hot_fix' | 'error';
export type TicketStatus = 'today' | 'this_week' | 'backlog' | 'in_progress' | 'review' | 'production' | 'closed';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface TicketFormData {
  need: string;
  desiredFlow: string;
  context: string;
  priority: Priority;
  desiredDate: Date | null;
}

export interface ClassificationResult {
  type: TicketType;
  confidence: number;
  reasoning: string;
  agent?: 'user_story_writer' | 'problem_solver' | 'skip';
}

export interface Ticket {
  id: string;
  nomenclature: string;
  module: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  desiredDate: Date | null;
  estimatedDeployDate?: Date;
  formData: TicketFormData;
  classification: ClassificationResult;
  notes: string[];
  linkedCardId?: string;
  followUpDate?: Date;
}

export interface EmailNotification {
  type: 'opening' | 'deploy_estimate' | 'completion' | 'follow_up';
  ticketId: string;
  sentAt: Date;
  recipients: string[];
}

export const MODULES = [
  'Auth',
  'Dashboard', 
  'Payments',
  'Users',
  'Reports',
  'Settings',
  'API',
  'Integration',
  'Core',
  'UI',
] as const;

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'Alta', color: 'bg-amber-100 text-amber-700' },
  critical: { label: 'Crítica', color: 'bg-red-100 text-red-700' },
};

export const STATUS_CONFIG: Record<TicketStatus, { label: string; columnName: string }> = {
  today: { label: 'Hoy', columnName: 'Today' },
  this_week: { label: 'Esta semana', columnName: 'This Week' },
  backlog: { label: 'Por definir', columnName: 'Backlog' },
  in_progress: { label: 'En progreso', columnName: 'In Progress' },
  review: { label: 'En revisión', columnName: 'Review' },
  production: { label: 'Producción', columnName: 'Production' },
  closed: { label: 'Cerrado', columnName: 'Closed' },
};

export const TYPE_CONFIG: Record<TicketType, { label: string; prefix: string; className: string }> = {
  fixed_scope: { label: 'Historia de Usuario', prefix: 'HU', className: 'type-hu' },
  bug_report: { label: 'Bug Report', prefix: 'BUG', className: 'type-bug' },
  hot_fix: { label: 'Hot Fix', prefix: 'BUG', className: 'type-hotfix' },
  error: { label: 'Error', prefix: 'ERR', className: 'status-error' },
};
