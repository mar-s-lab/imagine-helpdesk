import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FolderOpen, Loader2, AlertCircle, Settings2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import { ExecutiveSummary, ExecutiveSummarySkeleton } from '@/components/ExecutiveSummary';
import {
  useBasecampProjects,
  useExecutiveSummary,
  useExecutiveSummaryActions,
} from '@/hooks/useExecutiveSummary';
import { BasecampProject } from '@/types/executive-summary';

export default function ExecutiveSummaries() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = useBasecampProjects();

  const {
    data: summary,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useExecutiveSummary(selectedProjectId);

  const { refreshSummary } = useExecutiveSummaryActions();

  const handleProjectSelect = (project: BasecampProject) => {
    setSelectedProjectId(project.id);
  };

  const handleRefreshSummary = () => {
    if (selectedProjectId) {
      refreshSummary(selectedProjectId);
    }
  };

  // Error state for projects
  if (projectsError) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          activeView="table"
          onViewChange={() => {}}
          notificationCount={0}
          draftCount={0}
        />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription className="mt-2">
              {projectsError.message.includes('credentials')
                ? 'No se encontraron credenciales de Basecamp. Por favor, configura tu conexión en Ajustes.'
                : `Error al cargar proyectos: ${projectsError.message}`}
            </AlertDescription>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetchProjects()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/settings">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Ir a Ajustes
                </a>
              </Button>
            </div>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeView="table"
        onViewChange={() => {}}
        notificationCount={0}
        draftCount={0}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="font-serif text-3xl font-semibold text-foreground">
                Resúmenes Ejecutivos
              </h2>
            </div>
            <p className="text-muted-foreground">
              Vista consolidada del estado de tus proyectos en Basecamp
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Projects Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FolderOpen className="h-4 w-4" />
                    Proyectos
                  </CardTitle>
                  <CardDescription>
                    Selecciona un proyecto para ver su resumen
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingProjects ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-1 p-2">
                        {projects?.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => handleProjectSelect(project)}
                            className={cn(
                              'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                              'hover:bg-muted',
                              selectedProjectId === project.id
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-foreground'
                            )}
                          >
                            {project.name}
                          </button>
                        ))}
                        {projects?.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No se encontraron proyectos
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary Content */}
            <div className="lg:col-span-3">
              {!selectedProjectId ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-1">Selecciona un proyecto</h3>
                    <p className="text-muted-foreground text-sm">
                      Elige un proyecto de la lista para ver su resumen ejecutivo
                    </p>
                  </CardContent>
                </Card>
              ) : isLoadingSummary ? (
                <ExecutiveSummarySkeleton />
              ) : summaryError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error al cargar el resumen</AlertTitle>
                  <AlertDescription>
                    {summaryError.message}
                  </AlertDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={handleRefreshSummary}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar
                  </Button>
                </Alert>
              ) : summary ? (
                <ExecutiveSummary
                  summary={summary}
                  isLoading={isLoadingSummary}
                  onRefresh={handleRefreshSummary}
                />
              ) : null}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
