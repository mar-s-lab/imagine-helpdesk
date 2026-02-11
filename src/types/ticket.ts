import { Attachment } from '@/components/AttachmentInput';

export type TicketType = 'fixed_scope' | 'bug_report' | 'hot_fix' | 'error';
export type TicketStatus = 'draft' | 'today' | 'this_week' | 'backlog' | 'in_progress' | 'review' | 'production' | 'closed' | 'failed_report';

export type UrgencyLevel = 'blocks' | 'affects' | 'not_urgent';
export type AffectedParty = 'customers' | 'internal' | 'both';
export type OccurrenceLocation = 'app' | 'salesforce' | 'web' | 'internal_process' | 'other';

export interface TicketFormData {
  // New friendly questions
  whatIsHappening: string;      // ¿Qué está pasando o qué quieres cambiar?
  expectedFlow: string;          // ¿Cuál es el flujo esperado?
  whereOccurs: OccurrenceLocation; // ¿Dónde ocurre?
  whereOccursOther?: string;     // Si es "other", especificar
  affectedParty: AffectedParty;  // ¿A quién está afectando?
  urgency: UrgencyLevel;         // ¿Qué tan urgente es?
  additionalContext?: string;    // (Opcional) Contexto adicional
  attachments: Attachment[];
  
  // Legacy fields (for backward compatibility)
  need?: string;
  desiredFlow?: string;
  context?: string;
  desiredDate?: Date | null;
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
  // Basecamp sync tracking (Phase 1)
  basecampCardUrl?: string;
  syncAttempts?: number;
  lastSyncError?: string;
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

export const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; color: string }> = {
  blocks: { label: 'Bloquea operación', color: 'destructive' },
  affects: { label: 'Afecta trabajo', color: 'warning' },
  not_urgent: { label: 'No urgente', color: 'muted' },
};

export const AFFECTED_PARTY_CONFIG: Record<AffectedParty, { label: string }> = {
  customers: { label: 'Clientes' },
  internal: { label: 'Equipo interno' },
  both: { label: 'Ambos' },
};

export const LOCATION_CONFIG: Record<OccurrenceLocation, { label: string }> = {
  app: { label: 'App móvil' },
  salesforce: { label: 'Salesforce' },
  web: { label: 'Plataforma web' },
  internal_process: { label: 'Proceso interno' },
  other: { label: 'Otro' },
};
