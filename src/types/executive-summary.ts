// Executive Summary Types for Basecamp Integration

export interface BasecampProject {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'trashed';
  created_at: string;
  updated_at: string;
  url: string;
}

export interface ProjectStatistics {
  total_todos: number;
  completed_todos: number;
  pending_todos: number;
  total_todolists: number;
  progress_percentage: number;
}

export interface CardTableColumn {
  id: number;
  title: string;
  cards_count: number;
  cards: CardTableCard[];
}

export interface CardTableCard {
  id: number;
  title: string;
  completed: boolean;
  assignees: string[];
  due_on: string | null;
}

export interface CardTable {
  id: number;
  title: string;
  columns: CardTableColumn[];
}

export interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
  assignees: string[];
  due_on: string | null;
}

export interface TodoList {
  list_id: number;
  list_name: string;
  todos: TodoItem[];
}

export interface ExecutiveSummary {
  project: BasecampProject;
  statistics: ProjectStatistics;
  cardTable: CardTable | null;
  todos: TodoList[];
}

export interface BasecampCredentials {
  account_id: string;
  access_token: string;
}

export const EXECUTIVE_SUMMARY_STATUS_CONFIG = {
  active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
  archived: { label: 'Archivado', className: 'bg-gray-100 text-gray-800' },
  trashed: { label: 'Eliminado', className: 'bg-red-100 text-red-800' },
} as const;
