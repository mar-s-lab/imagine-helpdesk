import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Bug, 
  Layers,
  ArrowRight,
  Bot,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Ticket, TYPE_CONFIG } from '@/types/ticket';

interface ClassificationResultProps {
  ticket: Ticket;
  onContinue: () => void;
}

export function ClassificationResult({ ticket, onContinue }: ClassificationResultProps) {
  const typeConfig = TYPE_CONFIG[ticket.type];
  const confidencePercent = Math.round(ticket.classification.confidence * 100);

  const getIcon = () => {
    switch (ticket.type) {
      case 'hot_fix':
        return <Zap className="h-8 w-8 text-red-500" />;
      case 'bug_report':
        return <Bug className="h-8 w-8 text-amber-500" />;
      case 'fixed_scope':
        return <Layers className="h-8 w-8 text-primary" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-destructive" />;
    }
  };

  const getAgentInfo = () => {
    switch (ticket.classification.agent) {
      case 'user_story_writer':
        return {
          name: 'User Story Writer',
          description: 'Generará una Historia de Usuario con criterios de aceptación',
        };
      case 'problem_solver':
        return {
          name: 'Problem Solver',
          description: 'Analizará el problema y propondrá una solución técnica',
        };
      default:
        return null;
    }
  };

  const agentInfo = getAgentInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn(
        'border-2',
        ticket.type === 'error' && 'border-destructive bg-red-50/50',
        ticket.type === 'hot_fix' && 'border-red-400 bg-red-50/30',
        ticket.type === 'bug_report' && 'border-amber-400 bg-amber-50/30',
        ticket.type === 'fixed_scope' && 'border-primary bg-primary/5',
      )}>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3">
            {getIcon()}
          </div>
          <CardTitle className="font-serif text-2xl">
            {ticket.type === 'error' ? 'Ticket Requiere Atención' : 'Ticket Clasificado'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Classification Type */}
          <div className="text-center">
            <span className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold',
              typeConfig.className,
            )}>
              {typeConfig.label}
            </span>
          </div>

          {/* Confidence */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confianza de clasificación</span>
              <span className="font-medium">{confidencePercent}%</span>
            </div>
            <Progress value={confidencePercent} className="h-2" />
          </div>

          {/* Reasoning */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              {ticket.classification.reasoning}
            </p>
          </div>

          {/* Generated Nomenclature */}
          {ticket.type !== 'error' && (
            <div className="bg-card border rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">Nomenclatura generada</div>
              <code className="text-lg font-mono font-bold text-primary">
                {ticket.nomenclature}
              </code>
            </div>
          )}

          {/* Agent Assignment */}
          {agentInfo && (
            <div className="flex items-start gap-3 bg-primary/5 rounded-lg p-4">
              <Bot className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium text-sm">Agente: {agentInfo.name}</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {agentInfo.description}
                </p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Próximos pasos:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {ticket.type === 'error' ? (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-medium">1</span>
                    Editar las respuestas del formulario
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-medium">2</span>
                    Re-enviar el ticket o vincular card manual
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Borrador creado - pendiente de aprobación
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Revisar en el Tablero de Aprobación
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground/50" />
                    Al aprobar: se enviará a Basecamp
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground/50" />
                    Tabla de seguimiento se actualizará
                  </li>
                </>
              )}
            </ul>
          </div>

          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {ticket.type === 'error' ? 'Editar Ticket' : 'Ver Tablero de Aprobación'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
