import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Clock, 
  AlertTriangle, 
  Zap, 
  Layers, 
  MoreHorizontal,
  ExternalLink,
  Edit,
  Link as LinkIcon,
  X,
  CalendarDays,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Ticket, TYPE_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/ticket';

interface TicketCardProps {
  ticket: Ticket;
  onStatusChange?: (ticketId: string, status: Ticket['status']) => void;
  onEdit?: (ticketId: string) => void;
  onLinkCard?: (ticketId: string) => void;
  onClose?: (ticketId: string) => void;
}

export function TicketCard({ ticket, onStatusChange, onEdit, onLinkCard, onClose }: TicketCardProps) {
  const typeConfig = TYPE_CONFIG[ticket.type];
  const statusConfig = STATUS_CONFIG[ticket.status];
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];

  const getTypeIcon = () => {
    switch (ticket.type) {
      case 'hot_fix':
        return <Zap className="h-4 w-4" />;
      case 'bug_report':
        return <AlertTriangle className="h-4 w-4" />;
      case 'fixed_scope':
        return <Layers className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusClass = () => {
    switch (ticket.status) {
      case 'today':
        return 'status-today';
      case 'this_week':
        return 'status-week';
      case 'production':
        return 'status-production';
      case 'closed':
        return 'bg-slate-100 text-slate-500';
      default:
        return 'status-backlog';
    }
  };

  return (
    <div className={cn(
      'ticket-card animate-fade-in',
      ticket.type === 'error' && 'border-destructive/50 bg-red-50/30',
      ticket.type === 'hot_fix' && 'border-red-300 bg-red-50/20',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Nomenclature and Type */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <code className="text-sm font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {ticket.nomenclature}
            </code>
            <Badge variant="outline" className={cn('type-badge', typeConfig.className)}>
              {getTypeIcon()}
              <span className="ml-1">{typeConfig.label}</span>
            </Badge>
          </div>

          {/* Description */}
          <h3 className="font-serif text-lg font-medium text-foreground mb-1 line-clamp-2">
            {ticket.description}
          </h3>

          {/* Module and Priority */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="bg-secondary px-2 py-0.5 rounded text-xs font-medium">
              {ticket.module}
            </span>
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', priorityConfig.color)}>
              {priorityConfig.label}
            </span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(ticket.createdAt, "d MMM yyyy", { locale: es })}
            </span>
            {ticket.desiredDate && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Esperado: {format(ticket.desiredDate, "d MMM", { locale: es })}
              </span>
            )}
            {ticket.estimatedDeployDate && (
              <span className="flex items-center gap-1 text-primary">
                🚀 Deploy: {format(ticket.estimatedDeployDate, "d MMM", { locale: es })}
              </span>
            )}
          </div>

          {/* Agent info */}
          {ticket.classification.agent && ticket.classification.agent !== 'skip' && (
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="bg-primary/5 px-2 py-1 rounded inline-flex items-center gap-1">
                🤖 Agente: {ticket.classification.agent === 'user_story_writer' ? 'User Story Writer' : 'Problem Solver'}
              </span>
            </div>
          )}

          {/* Follow-up reminder for hot fixes */}
          {ticket.followUpDate && ticket.status !== 'closed' && (
            <div className="mt-2 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded inline-flex items-center gap-1">
              ⏰ Seguimiento: {format(ticket.followUpDate, "d MMM", { locale: es })}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Status Badge */}
          <Badge className={cn('status-badge', getStatusClass())}>
            {statusConfig.label}
          </Badge>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {ticket.type === 'error' ? (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(ticket.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar y Re-enviar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLinkCard?.(ticket.id)}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Vincular Card Manual
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onClose?.(ticket.id)}
                    className="text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cerrar Caso
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange?.(ticket.id, 'in_progress')}>
                    Mover a En Progreso
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange?.(ticket.id, 'review')}>
                    Mover a Revisión
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange?.(ticket.id, 'production')}>
                    Mover a Producción
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver en Basecamp
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Classification reasoning for errors */}
      {ticket.type === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <AlertTriangle className="inline h-4 w-4 mr-1" />
            {ticket.classification.reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
