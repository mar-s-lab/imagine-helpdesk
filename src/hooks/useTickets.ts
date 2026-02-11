import { useState, useCallback } from 'react';
import { Ticket, TicketFormData, TicketStatus, EmailNotification } from '@/types/ticket';
import { classifyTicket, generateNomenclature, determineInitialStatus, detectModule, getCombinedText, getDescription } from '@/lib/ticketClassifier';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

let ticketSequence = 1;

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const createTicket = useCallback(async (formData: TicketFormData): Promise<Ticket> => {
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const classification = classifyTicket(formData);
    const combinedText = getCombinedText(formData);
    const description = getDescription(formData);
    const module = detectModule(combinedText);
    
    // Determine if ticket goes to draft (for approval) or directly to error handling
    const shouldGoDraft = classification.type !== 'error';
    
    const ticket: Ticket = {
      id: `ticket-${Date.now()}`,
      nomenclature: classification.type !== 'error' 
        ? generateNomenclature(classification.type, module, description, ticketSequence++)
        : `ERR-${ticketSequence++}`,
      module,
      description,
      type: classification.type,
      // All valid tickets start as draft (pending approval)
      status: shouldGoDraft ? 'draft' : 'backlog',
      createdAt: new Date(),
      updatedAt: new Date(),
      desiredDate: formData.desiredDate || null,
      formData,
      classification,
      notes: [],
      basecampSynced: false,
    };

    // Add estimated deploy date for bugs and hotfixes
    if (ticket.type === 'bug_report' || ticket.type === 'hot_fix') {
      const deployDate = new Date();
      deployDate.setDate(deployDate.getDate() + (ticket.type === 'hot_fix' ? 1 : 7));
      ticket.estimatedDeployDate = deployDate;
    }

    // Add follow-up date for hot fixes
    if (ticket.type === 'hot_fix') {
      const followUp = new Date();
      followUp.setDate(followUp.getDate() + 5);
      ticket.followUpDate = followUp;
    }

    setTickets(prev => [ticket, ...prev]);
    
    setIsProcessing(false);
    return ticket;
  }, []);

  // Sync ticket to Basecamp
  const syncToBasecamp = useCallback(async (ticket: Ticket): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('basecamp-sync', {
        body: {
          nomenclature: ticket.nomenclature,
          description: ticket.description,
          module: ticket.module,
          type: ticket.type,
          formData: {
            need: ticket.formData.need,
            desiredFlow: ticket.formData.desiredFlow,
            context: ticket.formData.context,
          },
        },
      });

      if (error) {
        console.error('Basecamp sync error:', error);
        toast.error(`Error sincronizando con Basecamp: ${error.message}`);
        return false;
      }

      if (data?.success) {
        if (import.meta.env.DEV) {
          console.log('Basecamp sync successful:', data);
        }
        return true;
      }
      
      toast.error(data?.error || 'Error desconocido sincronizando con Basecamp');
      return false;
    } catch (err) {
      console.error('Basecamp sync exception:', err);
      toast.error('Error de conexión con Basecamp');
      return false;
    }
  }, []);

  // Approve ticket - moves to proper status and sends to Basecamp
  const approveTicket = useCallback(async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status !== 'draft') return;

    // Try to sync to Basecamp first
    const synced = await syncToBasecamp(ticket);
    
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId && t.status === 'draft') {
        const newStatus = determineInitialStatus(t.type);
        const updated = {
          ...t,
          status: newStatus,
          updatedAt: new Date(),
          basecampSynced: synced,
        };
        
        // Send notifications after approval
        sendOpeningNotification(updated);
        if (updated.estimatedDeployDate) {
          sendDeployEstimateNotification(updated);
        }
        
        return updated;
      }
      return t;
    }));
    
    if (synced) {
      toast.success('✅ Ticket aprobado y enviado a Basecamp');
    } else {
      toast.warning('⚠️ Ticket aprobado pero no se pudo sincronizar con Basecamp');
    }
  }, [tickets, syncToBasecamp]);

  // Reject ticket - marks as failed report
  const rejectTicket = useCallback((ticketId: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: 'failed_report' as TicketStatus,
          updatedAt: new Date(),
          basecampSynced: false,
        };
      }
      return ticket;
    }));
    
    toast.info('📋 Ticket marcado como Reporte Fallido');
  }, []);

  // Delete draft ticket
  const deleteTicket = useCallback((ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    toast.info('🗑️ Borrador eliminado');
  }, []);

  const updateTicketStatus = useCallback(async (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        const updated = {
          ...ticket,
          status: newStatus,
          updatedAt: new Date(),
        };
        
        // Send completion notification when moved to production
        if (newStatus === 'production') {
          sendCompletionNotification(updated);
        }
        
        return updated;
      }
      return ticket;
    }));
    
    toast.success('Estado actualizado correctamente');
  }, []);

  const updateTicket = useCallback((ticketId: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, ...updates, updatedAt: new Date() }
        : ticket
    ));
  }, []);

  const resubmitTicket = useCallback(async (ticketId: string, formData: TicketFormData): Promise<Ticket> => {
    // Remove old ticket
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    
    // Create new ticket with updated data
    return createTicket(formData);
  }, [createTicket]);

  const linkManualCard = useCallback((ticketId: string, cardId: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId
        ? { ...ticket, linkedCardId: cardId, updatedAt: new Date() }
        : ticket
    ));
    toast.success('Card vinculada correctamente');
  }, []);

  const closeTicket = useCallback((ticketId: string) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status: 'closed' as TicketStatus, updatedAt: new Date() }
        : ticket
    ));
    toast.info('Ticket cerrado');
  }, []);

  const addNote = useCallback((ticketId: string, note: string) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, notes: [...ticket.notes, note], updatedAt: new Date() }
        : ticket
    ));
  }, []);

  // Notification helpers
  const sendOpeningNotification = async (ticket: Ticket) => {
    const notification: EmailNotification = {
      type: 'opening',
      ticketId: ticket.id,
      sentAt: new Date(),
      recipients: ['team@company.com', 'support@company.com'],
    };
    setNotifications(prev => [...prev, notification]);
    toast.info(`📧 Aviso de apertura enviado: ${ticket.nomenclature}`);
  };

  const sendDeployEstimateNotification = async (ticket: Ticket) => {
    const notification: EmailNotification = {
      type: 'deploy_estimate',
      ticketId: ticket.id,
      sentAt: new Date(),
      recipients: ['support@company.com'],
    };
    setNotifications(prev => [...prev, notification]);
    toast.info(`📧 Fecha estimada de despliegue enviada`);
  };

  const sendCompletionNotification = async (ticket: Ticket) => {
    const notification: EmailNotification = {
      type: 'completion',
      ticketId: ticket.id,
      sentAt: new Date(),
      recipients: ['team@company.com', 'requester@company.com'],
    };
    setNotifications(prev => [...prev, notification]);
    toast.success(`✅ Notificación de completitud enviada: ${ticket.nomenclature}`);
  };

  return {
    tickets,
    notifications,
    isProcessing,
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
