import { useState, useCallback } from 'react';
import { Ticket, TicketFormData, TicketStatus, EmailNotification } from '@/types/ticket';
import { classifyTicket, generateNomenclature, determineInitialStatus, detectModule } from '@/lib/ticketClassifier';
import { toast } from 'sonner';

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
    const module = detectModule(`${formData.need} ${formData.desiredFlow} ${formData.context}`);
    
    const ticket: Ticket = {
      id: `ticket-${Date.now()}`,
      nomenclature: classification.type !== 'error' 
        ? generateNomenclature(classification.type, module, formData.need, ticketSequence++)
        : `ERR-${ticketSequence++}`,
      module,
      description: formData.need,
      type: classification.type,
      status: classification.type !== 'error' ? determineInitialStatus(classification.type) : 'backlog',
      priority: formData.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      desiredDate: formData.desiredDate,
      formData,
      classification,
      notes: [],
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
    
    // Send notifications
    if (classification.type !== 'error') {
      await sendOpeningNotification(ticket);
      
      if (ticket.estimatedDeployDate) {
        await sendDeployEstimateNotification(ticket);
      }
    }
    
    setIsProcessing(false);
    return ticket;
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
    updateTicketStatus,
    updateTicket,
    resubmitTicket,
    linkManualCard,
    closeTicket,
    addNote,
  };
}
