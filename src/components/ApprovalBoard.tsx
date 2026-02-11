import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  Send,
  AlertTriangle,
  FileX,
  Eye,
  Bot,
  Zap,
  Bug,
  Layers,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Ticket, TYPE_CONFIG } from '@/types/ticket';
import { useLanguage } from '@/contexts/LanguageContext';

interface ApprovalBoardProps {
  tickets: Ticket[];
  onApprove: (ticketId: string) => void;
  onReject: (ticketId: string) => void;
  onEdit: (ticketId: string) => void;
  onDelete: (ticketId: string) => void;
}

export function ApprovalBoard({ 
  tickets, 
  onApprove, 
  onReject, 
  onEdit,
  onDelete,
}: ApprovalBoardProps) {
  const { t } = useLanguage();
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'approve' | 'reject' | 'delete';
    ticketId: string;
    nomenclature: string;
  } | null>(null);
  const [previewTicket, setPreviewTicket] = useState<Ticket | null>(null);

  // Filter only draft tickets (pending approval)
  const draftTickets = tickets.filter(t => t.status === 'draft' && t.type !== 'error');

  const getTypeIcon = (type: Ticket['type']) => {
    switch (type) {
      case 'hot_fix':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'bug_report':
        return <Bug className="h-4 w-4 text-amber-500" />;
      case 'fixed_scope':
        return <Layers className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  const getAgentLabel = (agent?: string) => {
    switch (agent) {
      case 'user_story_writer':
        return 'User Story Writer';
      case 'problem_solver':
        return 'Problem Solver';
      case 'skip':
        return 'Skip';
      default:
        return null;
    }
  };

  const handleConfirmAction = () => {
    if (!confirmDialog) return;
    
    switch (confirmDialog.type) {
      case 'approve':
        onApprove(confirmDialog.ticketId);
        break;
      case 'reject':
        onReject(confirmDialog.ticketId);
        break;
      case 'delete':
        onDelete(confirmDialog.ticketId);
        break;
    }
    setConfirmDialog(null);
  };

  if (draftTickets.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileX className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-lg mb-2">{t('approvalBoard.empty')}</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            {t('approvalBoard.emptyDescription')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              {t('approvalBoard.title')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('approvalBoard.subtitle')}
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {draftTickets.length} {t('approvalBoard.pending')}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {draftTickets.map((ticket) => {
              const typeConfig = TYPE_CONFIG[ticket.type];
              const agentLabel = getAgentLabel(ticket.classification.agent);
              
              return (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={cn(
                    'border-2 transition-shadow hover:shadow-lg',
                    ticket.type === 'hot_fix' && 'border-red-300',
                    ticket.type === 'bug_report' && 'border-amber-300',
                    ticket.type === 'fixed_scope' && 'border-primary/50',
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(ticket.type)}
                          <Badge className={cn('text-xs', typeConfig.className)}>
                            {typeConfig.label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPreviewTicket(ticket)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-base font-mono mt-2">
                        {ticket.nomenclature}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Description preview */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ticket.description}
                      </p>

                      {/* Agent */}
                      {agentLabel && (
                        <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-2 py-1.5">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                          <span className="text-muted-foreground">Agente:</span>
                          <span className="font-medium">{agentLabel}</span>
                        </div>
                      )}

                      {/* Module */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{t('ticket.module')}:</span>
                        <Badge variant="outline">{ticket.module}</Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => setConfirmDialog({
                            type: 'approve',
                            ticketId: ticket.id,
                            nomenclature: ticket.nomenclature,
                          })}
                        >
                          <Send className="h-3.5 w-3.5" />
                          {t('approvalBoard.approve')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 gap-1.5"
                          onClick={() => setConfirmDialog({
                            type: 'reject',
                            ticketId: ticket.id,
                            nomenclature: ticket.nomenclature,
                          })}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {t('approvalBoard.reject')}
                        </Button>
                      </div>

                      {/* Secondary actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1.5"
                          onClick={() => onEdit(ticket.id)}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          {t('action.edit')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5 text-destructive hover:text-destructive"
                          onClick={() => setConfirmDialog({
                            type: 'delete',
                            ticketId: ticket.id,
                            nomenclature: ticket.nomenclature,
                          })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog?.type === 'approve' && (
                <>
                  <CheckCircle className="h-5 w-5 text-primary" />
                  {t('approvalBoard.confirmApprove')}
                </>
              )}
              {confirmDialog?.type === 'reject' && (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  {t('approvalBoard.confirmReject')}
                </>
              )}
              {confirmDialog?.type === 'delete' && (
                <>
                  <Trash2 className="h-5 w-5 text-destructive" />
                  {t('approvalBoard.confirmDelete')}
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.type === 'approve' && (
                <>
                  {t('approvalBoard.approveDescription')}
                  <code className="block mt-2 p-2 bg-muted rounded font-mono text-sm">
                    {confirmDialog.nomenclature}
                  </code>
                </>
              )}
              {confirmDialog?.type === 'reject' && (
                <>
                  {t('approvalBoard.rejectDescription')}
                  <code className="block mt-2 p-2 bg-muted rounded font-mono text-sm">
                    {confirmDialog.nomenclature}
                  </code>
                </>
              )}
              {confirmDialog?.type === 'delete' && (
                <>
                  {t('approvalBoard.deleteDescription')}
                  <code className="block mt-2 p-2 bg-muted rounded font-mono text-sm">
                    {confirmDialog.nomenclature}
                  </code>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('action.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={cn(
                confirmDialog?.type === 'reject' && 'bg-amber-500 hover:bg-amber-600',
                confirmDialog?.type === 'delete' && 'bg-destructive hover:bg-destructive/90',
              )}
            >
              {confirmDialog?.type === 'approve' && t('approvalBoard.sendToBasecamp')}
              {confirmDialog?.type === 'reject' && t('approvalBoard.markAsFailed')}
              {confirmDialog?.type === 'delete' && t('action.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTicket} onOpenChange={() => setPreviewTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <code className="font-mono">{previewTicket?.nomenclature}</code>
            </DialogTitle>
          </DialogHeader>
          
          {previewTicket && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getTypeIcon(previewTicket.type)}
                <Badge className={cn(TYPE_CONFIG[previewTicket.type].className)}>
                  {TYPE_CONFIG[previewTicket.type].label}
                </Badge>
                <Badge variant="outline">{previewTicket.module}</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    {t('form.need')}
                  </h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                    {previewTicket.formData.need}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    {t('form.desiredFlow')}
                  </h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                    {previewTicket.formData.desiredFlow}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    {t('form.context')}
                  </h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                    {previewTicket.formData.context}
                  </p>
                </div>

                {previewTicket.formData.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {t('form.attachments')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {previewTicket.formData.attachments.map((att, i) => (
                        <Badge key={i} variant="secondary">
                          {att.type}: {att.name || att.url}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    setPreviewTicket(null);
                    setConfirmDialog({
                      type: 'approve',
                      ticketId: previewTicket.id,
                      nomenclature: previewTicket.nomenclature,
                    });
                  }}
                >
                  <Send className="h-4 w-4" />
                  {t('approvalBoard.approve')}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => {
                    setPreviewTicket(null);
                    setConfirmDialog({
                      type: 'reject',
                      ticketId: previewTicket.id,
                      nomenclature: previewTicket.nomenclature,
                    });
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  {t('approvalBoard.reject')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
