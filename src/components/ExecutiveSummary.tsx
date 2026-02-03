import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Circle,
  ExternalLink,
  Kanban,
  ListTodo,
  RefreshCw,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectStatsCard, ProjectStatsCardSkeleton } from '@/components/ProjectStatsCard';
import { ExecutiveSummary as ExecutiveSummaryType, EXECUTIVE_SUMMARY_STATUS_CONFIG } from '@/types/executive-summary';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExecutiveSummaryProps {
  summary: ExecutiveSummaryType;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function ExecutiveSummary({ summary, isLoading, onRefresh }: ExecutiveSummaryProps) {
  const { project, statistics, cardTable, todos } = summary;
  const statusConfig = EXECUTIVE_SUMMARY_STATUS_CONFIG[project.status as keyof typeof EXECUTIVE_SUMMARY_STATUS_CONFIG];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-semibold">{project.name}</h2>
            <Badge className={cn('text-xs', statusConfig?.className)}>
              {statusConfig?.label || project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground text-sm max-w-2xl">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
              Actualizar
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href={project.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver en Basecamp
            </a>
          </Button>
        </div>
      </motion.div>

      {/* Statistics */}
      <ProjectStatsCard statistics={statistics} />

      {/* Card Table / Kanban */}
      {cardTable && cardTable.columns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Kanban className="h-5 w-5 text-primary" />
                {cardTable.title || 'Tablero Kanban'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4 min-w-max">
                  {cardTable.columns.map((column, index) => (
                    <motion.div
                      key={column.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="w-64 flex-shrink-0"
                    >
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm">{column.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {column.cards_count}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {column.cards.slice(0, 5).map((card) => (
                            <div
                              key={card.id}
                              className={cn(
                                'bg-card p-3 rounded-md border text-sm',
                                card.completed && 'opacity-60'
                              )}
                            >
                              <div className="flex items-start gap-2">
                                {card.completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                )}
                                <span className={cn(card.completed && 'line-through')}>
                                  {card.title}
                                </span>
                              </div>
                              {(card.assignees.length > 0 || card.due_on) && (
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  {card.assignees.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {card.assignees.slice(0, 2).join(', ')}
                                      {card.assignees.length > 2 && ` +${card.assignees.length - 2}`}
                                    </span>
                                  )}
                                  {card.due_on && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(new Date(card.due_on), 'dd MMM', { locale: es })}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {column.cards.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              +{column.cards.length - 5} más
                            </p>
                          )}
                          {column.cards.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              Sin tarjetas
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Todo Lists */}
      {todos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListTodo className="h-5 w-5 text-primary" />
                Listas de Tareas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todos.map((todoList, listIndex) => (
                  <motion.div
                    key={todoList.list_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * listIndex }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{todoList.list_name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {todoList.todos.filter(t => t.completed).length}/{todoList.todos.length} completadas
                      </span>
                    </div>
                    <div className="space-y-1 pl-2">
                      {todoList.todos.slice(0, 5).map((todo) => (
                        <div
                          key={todo.id}
                          className={cn(
                            'flex items-start gap-2 py-1 text-sm',
                            todo.completed && 'text-muted-foreground'
                          )}
                        >
                          {todo.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          )}
                          <span className={cn(todo.completed && 'line-through')}>
                            {todo.title}
                          </span>
                          {todo.due_on && (
                            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(todo.due_on), 'dd MMM', { locale: es })}
                            </span>
                          )}
                        </div>
                      ))}
                      {todoList.todos.length > 5 && (
                        <p className="text-xs text-muted-foreground py-1">
                          +{todoList.todos.length - 5} tareas más
                        </p>
                      )}
                    </div>
                    {listIndex < todos.length - 1 && <Separator className="mt-4" />}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!cardTable && todos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-1">Sin datos disponibles</h3>
            <p className="text-muted-foreground text-sm">
              Este proyecto no tiene tareas ni tableros Kanban configurados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Skeleton loader
export function ExecutiveSummarySkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-muted rounded animate-pulse" />
          <div className="h-9 w-36 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <ProjectStatsCardSkeleton />

      {/* Card skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-64 h-48 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
