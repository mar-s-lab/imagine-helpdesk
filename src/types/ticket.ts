import { Attachment } from '@/components/AttachmentInput';

export type TicketType = 'fixed_scope' | 'bug_report' | 'hot_fix' | 'error';
export type TicketStatus = 'draft' | 'today' | 'this_week' | 'backlog' | 'in_progress' | 'review' | 'production' | 'closed' | 'failed_report';

export interface TicketFormData {
  need: string;
  desiredFlow: string;
  context: string;
  desiredDate: Date | null;
  attachments: Attachment[];
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
  createdAt: Date;
  updatedAt: Date;
  desiredDate: Date | null;
  estimatedDeployDate?: Date;
  formData: TicketFormData;
  classification: ClassificationResult;
  notes: string[];
  linkedCardId?: string;
  followUpDate?: Date;
  basecampSynced?: boolean;
  rejectionReason?: string;
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

export const STATUS_CONFIG: Record<TicketStatus, { label: string; columnName: string }> = {
  draft: { label: 'Borrador', columnName: 'Draft' },
  today: { label: 'Hoy', columnName: 'Today' },
  this_week: { label: 'Esta semana', columnName: 'This Week' },
  backlog: { label: 'Por definir', columnName: 'Backlog' },
  in_progress: { label: 'En progreso', columnName: 'In Progress' },
  review: { label: 'En revisión', columnName: 'Review' },
  production: { label: 'Producción', columnName: 'Production' },
  closed: { label: 'Cerrado', columnName: 'Closed' },
  failed_report: { label: 'Reporte Fallido', columnName: 'Failed Report' },
};

export const TYPE_CONFIG: Record<TicketType, { label: string; prefix: string; className: string }> = {
  fixed_scope: { label: 'Historia de Usuario', prefix: 'HU', className: 'type-hu' },
  bug_report: { label: 'Bug Report', prefix: 'BUG', className: 'type-bug' },
  hot_fix: { label: 'Hot Fix', prefix: 'BUG', className: 'type-hotfix' },
  error: { label: 'Error', prefix: 'ERR', className: 'status-error' },
};
