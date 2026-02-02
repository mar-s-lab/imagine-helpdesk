import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, TicketFormData, TicketStatus, EmailNotification, ClassificationResult } from '@/types/ticket';
import { classifyTicket, generateNomenclature, determineInitialStatus, detectModule, getCombinedText, getDescription } from '@/lib/ticketClassifier';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

// Keys for React Query
const TICKETS_KEY = ['tickets'];

// Transform DB row to Ticket type
function dbRowToTicket(row: {
  id: string;
  nomenclature: string;
  module: string;
  description: string;
  type: string;
  status: string;
  form_data: unknown;
  classification: unknown;
  notes: string[] | null;
  desired_date: string | null;
  estimated_deploy_date: string | null;
  follow_up_date: string | null;
  basecamp_card_id: string | null;
  basecamp_card_url: string | null;
  basecamp_synced: boolean | null;
  sync_attempts: number | null;
  last_sync_error: string | null;
  rejection_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}): Ticket {
  const formData = row.form_data as TicketFormData;
  const classification = row.classification as ClassificationResult;
  
  return {
    id: row.id,
    nomenclature: row.nomenclature,
    module: row.module,
    description: row.description,
    type: row.type as Ticket['type'],
    status: row.status as TicketStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    desiredDate: row.desired_date ? new Date(row.desired_date) : null,
    estimatedDeployDate: row.estimated_deploy_date ? new Date(row.estimated_deploy_date) : undefined,
    followUpDate: row.follow_up_date ? new Date(row.follow_up_date) : undefined,
    formData,
    classification,
    notes: row.notes || [],
    linkedCardId: row.basecamp_card_id || undefined,
    basecampSynced: row.basecamp_synced || false,
    rejectionReason: row.rejection_reason || undefined,
    basecampCardUrl: row.basecamp_card_url || undefined,
    syncAttempts: row.sync_attempts || 0,
    lastSyncError: row.last_sync_error || undefined,
  };
}

// Generate a unique nomenclature sequence from existing tickets
async function getNextSequence(): Promise<number> {
  const { data } = await supabase
    .from('tickets')
    .select('nomenclature')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (!data || data.length === 0) return 1;
  
  // Extract sequence numbers from nomenclatures
  const sequences = data
    .map(t => {
      const match = t.nomenclature.match(/-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  
  return sequences.length > 0 ? Math.max(...sequences) + 1 : 1;
}

export function useTickets() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: TICKETS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }
      
      return (data || []).map(dbRowToTicket);
    },
  });

  // Create ticket mutation
  const createMutation = useMutation({
    mutationFn: async (formData: TicketFormData): Promise<Ticket> => {
      if (!user) throw new Error('User not authenticated');
      
      const classification = classifyTicket(formData);
      const combinedText = getCombinedText(formData);
      const description = getDescription(formData);
      const module = detectModule(combinedText);
      
      const shouldGoDraft = classification.type !== 'error';
      const sequence = await getNextSequence();
      
      const nomenclature = classification.type !== 'error' 
        ? generateNomenclature(classification.type, module, description, sequence)
        : `ERR-${sequence}`;

      // Calculate dates
      let estimatedDeployDate: Date | undefined;
      let followUpDate: Date | undefined;
      
      if (classification.type === 'bug_report' || classification.type === 'hot_fix') {
        estimatedDeployDate = new Date();
        estimatedDeployDate.setDate(estimatedDeployDate.getDate() + (classification.type === 'hot_fix' ? 1 : 7));
      }
      
      if (classification.type === 'hot_fix') {
        followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + 5);
      }

      const { data, error } = await supabase
        .from('tickets')
        .insert([{
          nomenclature,
          module,
          description,
          type: classification.type,
          status: shouldGoDraft ? 'draft' : 'backlog',
          form_data: JSON.parse(JSON.stringify(formData)) as Json,
          classification: JSON.parse(JSON.stringify(classification)) as Json,
          notes: [] as string[],
          desired_date: formData.desiredDate?.toISOString() || null,
          estimated_deploy_date: estimatedDeployDate?.toISOString() || null,
          follow_up_date: followUpDate?.toISOString() || null,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        throw error;
      }

      return dbRowToTicket(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_KEY });
    },
  });

  // Update ticket mutation
  const updateMutation = useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: Partial<{
      status: TicketStatus;
      notes: string[];
      basecamp_card_id: string;
      basecamp_card_url: string;
      basecamp_synced: boolean;
      sync_attempts: number;
      last_sync_error: string | null;
      rejection_reason: string;
    }> }) => {
      const { error } = await supabase
        .from('tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error updating ticket:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_KEY });
    },
  });

  // Delete ticket mutation
  const deleteMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) {
        console.error('Error deleting ticket:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_KEY });
    },
  });

  // Sync ticket to Basecamp and update DB
  const syncToBasecamp = useCallback(async (ticket: Ticket): Promise<{ success: boolean; cardId?: string; cardUrl?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('basecamp-sync', {
        body: {
          nomenclature: ticket.nomenclature,
          description: ticket.description,
          module: ticket.module,
          type: ticket.type,
          formData: {
            need: ticket.formData.need || ticket.formData.whatIsHappening,
            desiredFlow: ticket.formData.desiredFlow || ticket.formData.expectedFlow,
            context: ticket.formData.context || ticket.formData.additionalContext || '',
          },
        },
      });

      if (error) {
        console.error('Basecamp sync error:', error);
        
        // Update sync attempts and error
        await supabase
          .from('tickets')
          .update({
            sync_attempts: (ticket.syncAttempts || 0) + 1,
            last_sync_error: error.message,
          })
          .eq('id', ticket.id);
        
        toast.error(`Error sincronizando con Basecamp: ${error.message}`);
        return { success: false };
      }

      if (data?.success) {
        return { 
          success: true, 
          cardId: data.cardId,
          cardUrl: data.cardUrl,
        };
      }
      
      // Update sync attempts and error
      await supabase
        .from('tickets')
        .update({
          sync_attempts: (ticket.syncAttempts || 0) + 1,
          last_sync_error: data?.error || 'Unknown error',
        })
        .eq('id', ticket.id);
      
      toast.error(data?.error || 'Error desconocido sincronizando con Basecamp');
      return { success: false };
    } catch (err) {
      console.error('Basecamp sync exception:', err);
      toast.error('Error de conexión con Basecamp');
      return { success: false };
    }
  }, []);

  // Approve ticket - syncs to Basecamp and updates status
  const approveTicket = useCallback(async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status !== 'draft') return;

    // Try to sync to Basecamp first
    const syncResult = await syncToBasecamp(ticket);
    
    if (!syncResult.success) {
      toast.error('❌ No se pudo enviar a Basecamp. El ticket permanece en Aprobaciones para reintentar.');
      queryClient.invalidateQueries({ queryKey: TICKETS_KEY });
      return;
    }
    
    // Update ticket with Basecamp info and new status
    const newStatus = determineInitialStatus(ticket.type);
    
    const { error } = await supabase
      .from('tickets')
      .update({
        status: newStatus,
        basecamp_card_id: syncResult.cardId,
        basecamp_card_url: syncResult.cardUrl,
        basecamp_synced: true,
        last_sync_error: null,
      })
      .eq('id', ticketId);

    if (error) {
      console.error('Error updating ticket after sync:', error);
      toast.error('Error actualizando ticket');
      return;
    }

    queryClient.invalidateQueries({ queryKey: TICKETS_KEY });
    toast.success('✅ Ticket aprobado y enviado a Basecamp');
  }, [tickets, syncToBasecamp, queryClient]);

  // Reject ticket - marks as failed report
  const rejectTicket = useCallback(async (ticketId: string) => {
    await updateMutation.mutateAsync({
      ticketId,
      updates: {
        status: 'failed_report' as TicketStatus,
        basecamp_synced: false,
      },
    });
    toast.info('📋 Ticket marcado como Reporte Fallido');
  }, [updateMutation]);

  // Delete draft ticket
  const deleteTicket = useCallback(async (ticketId: string) => {
    await deleteMutation.mutateAsync(ticketId);
    toast.info('🗑️ Borrador eliminado');
  }, [deleteMutation]);

  // Update ticket status
  const updateTicketStatus = useCallback(async (ticketId: string, newStatus: TicketStatus) => {
    await updateMutation.mutateAsync({
      ticketId,
      updates: { status: newStatus },
    });
    
    if (newStatus === 'production') {
      toast.success('✅ Ticket movido a producción');
    } else {
      toast.success('Estado actualizado correctamente');
    }
  }, [updateMutation]);

  // Generic update
  const updateTicket = useCallback(async (ticketId: string, updates: Partial<Ticket>) => {
    const dbUpdates: Record<string, unknown> = {};
    
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason;
    
    await updateMutation.mutateAsync({ ticketId, updates: dbUpdates as Record<string, unknown> });
  }, [updateMutation]);

  // Resubmit ticket
  const resubmitTicket = useCallback(async (ticketId: string, formData: TicketFormData): Promise<Ticket> => {
    await deleteMutation.mutateAsync(ticketId);
    return createMutation.mutateAsync(formData);
  }, [deleteMutation, createMutation]);

  // Link manual card
  const linkManualCard = useCallback(async (ticketId: string, cardId: string) => {
    await updateMutation.mutateAsync({
      ticketId,
      updates: { basecamp_card_id: cardId },
    });
    toast.success('Card vinculada correctamente');
  }, [updateMutation]);

  // Close ticket
  const closeTicket = useCallback(async (ticketId: string) => {
    await updateMutation.mutateAsync({
      ticketId,
      updates: { status: 'closed' as TicketStatus },
    });
    toast.info('Ticket cerrado');
  }, [updateMutation]);

  // Add note
  const addNote = useCallback(async (ticketId: string, note: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    await updateMutation.mutateAsync({
      ticketId,
      updates: { notes: [...ticket.notes, note] },
    });
  }, [tickets, updateMutation]);

  // Create ticket wrapper
  const createTicket = useCallback(async (formData: TicketFormData): Promise<Ticket> => {
    return createMutation.mutateAsync(formData);
  }, [createMutation]);

  return {
    tickets,
    notifications: [] as EmailNotification[], // Notifications can be added later
    isProcessing: createMutation.isPending || isLoading,
    createTicket,
    approveTicket,
    rejectTicket,
    deleteTicket,
    updateTicketStatus,
    updateTicket,
    resubmitTicket,
    linkManualCard,
    closeTicket,
    addNote,
  };
}
