import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ListTodo, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProjectStatistics } from '@/types/executive-summary';
import { cn } from '@/lib/utils';

interface ProjectStatsCardProps {
  statistics: ProjectStatistics;
  className?: string;
}

export function ProjectStatsCard({ statistics, className }: ProjectStatsCardProps) {
  const stats = [
    {
      label: 'Total de tareas',
      value: statistics.total_todos,
      icon: ListTodo,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Completadas',
      value: statistics.completed_todos,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Pendientes',
      value: statistics.pending_todos,
      icon: Circle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      label: 'Listas',
      value: statistics.total_todolists,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center p-4 rounded-lg bg-muted/50"
            >
              <div className={cn('p-2 rounded-full mb-2', stat.bgColor)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs text-muted-foreground text-center">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso general</span>
            <span className="font-semibold">{statistics.progress_percentage}%</span>
          </div>
          <Progress
            value={statistics.progress_percentage}
            className="h-3"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton loader for the stats card
export function ProjectStatsCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center p-4 rounded-lg bg-muted/50 animate-pulse"
            >
              <div className="w-9 h-9 rounded-full bg-muted mb-2" />
              <div className="h-8 w-12 bg-muted rounded mb-1" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-8 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
