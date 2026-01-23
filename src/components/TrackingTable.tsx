import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpDown } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Ticket, TYPE_CONFIG, STATUS_CONFIG } from '@/types/ticket';

interface TrackingTableProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
}

export function TrackingTable({ tickets, onTicketClick }: TrackingTableProps) {
  const getStatusClass = (status: Ticket['status']) => {
    switch (status) {
      case 'today':
        return 'status-today';
      case 'this_week':
        return 'status-week';
      case 'production':
        return 'status-production';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'status-backlog';
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No hay tickets registrados aún</p>
        <p className="text-sm mt-1">Crea un nuevo ticket para comenzar</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[180px]">
              <Button variant="ghost" size="sm" className="h-8 -ml-3 font-medium">
                Nomenclatura
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="max-w-[250px]">Descripción</TableHead>
            <TableHead>Módulo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creación</TableHead>
            <TableHead>Entrega Est.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => {
            const typeConfig = TYPE_CONFIG[ticket.type];
            const statusConfig = STATUS_CONFIG[ticket.status];

            return (
              <TableRow 
                key={ticket.id}
                className={cn(
                  'cursor-pointer transition-colors',
                  ticket.type === 'error' && 'bg-destructive/5',
                  ticket.type === 'hot_fix' && 'bg-accent/30',
                )}
                onClick={() => onTicketClick?.(ticket)}
              >
                <TableCell className="font-mono text-sm font-medium">
                  {ticket.nomenclature}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn('type-badge text-xs', typeConfig.className)}
                  >
                    {typeConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[250px] truncate text-sm">
                  {ticket.description}
                </TableCell>
                <TableCell>
                  <span className="bg-secondary px-2 py-0.5 rounded text-xs font-medium">
                    {ticket.module}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={cn('status-badge', getStatusClass(ticket.status))}>
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(ticket.createdAt, "d MMM", { locale: es })}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {ticket.estimatedDeployDate 
                    ? format(ticket.estimatedDeployDate, "d MMM", { locale: es })
                    : '—'
                  }
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
