import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, AlertTriangle, Zap, Layers, FileEdit } from 'lucide-react';

import { Header } from '@/components/Header';
import { TicketForm } from '@/components/TicketForm';
import { TicketCard } from '@/components/TicketCard';
import { TrackingTable } from '@/components/TrackingTable';
import { ClassificationResult } from '@/components/ClassificationResult';
import { EditTicketDialog } from '@/components/EditTicketDialog';
import { ApprovalBoard } from '@/components/ApprovalBoard';
import { useTickets } from '@/hooks/useTickets';
import { Ticket, TicketFormData, TicketStatus } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ViewState = 'form' | 'table' | 'result' | 'approvals';

const Index = () => {
  const [activeView, setActiveView] = useState<'form' | 'table' | 'approvals'>('form');
  const [viewState, setViewState] = useState<ViewState>('form');
  const [lastCreatedTicket, setLastCreatedTicket] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const {
    tickets,
    notifications,
    isProcessing,
    createTicket,
    approveTicket,
    rejectTicket,
    deleteTicket,
    updateTicketStatus,
    resubmitTicket,
    linkManualCard,
    closeTicket,
  } = useTickets();

  const handleSubmit = async (formData: TicketFormData) => {
    const ticket = await createTicket(formData);
    setLastCreatedTicket(ticket);
    setViewState('result');
  };

  const handleContinueFromResult = () => {
    if (lastCreatedTicket?.type === 'error') {
      setEditingTicket(lastCreatedTicket);
      setShowEditDialog(true);
    } else {
      // Go to approvals to see the new draft
      setActiveView('approvals');
      setViewState('approvals');
    }
    setLastCreatedTicket(null);
  };

  const handleViewChange = (view: 'form' | 'table' | 'approvals') => {
    setActiveView(view);
    setViewState(view);
    setLastCreatedTicket(null);
  };

  const handleEditTicket = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      setEditingTicket(ticket);
      setShowEditDialog(true);
    }
  };

  const handleResubmit = async (ticketId: string, formData: TicketFormData) => {
    const newTicket = await resubmitTicket(ticketId, formData);
    setLastCreatedTicket(newTicket);
    setShowEditDialog(false);
    setViewState('result');
  };

  const handleLinkCard = (ticketId: string, cardId: string) => {
    linkManualCard(ticketId, cardId);
  };

  const handleCloseTicket = (ticketId: string) => {
    closeTicket(ticketId);
  };

  const handleStatusChange = (ticketId: string, status: TicketStatus) => {
    updateTicketStatus(ticketId, status);
  };

  // Stats - excluding drafts and failed reports from main stats
  const activeTickets = tickets.filter(t => t.status !== 'draft' && t.status !== 'failed_report');
  const draftTickets = tickets.filter(t => t.status === 'draft');
  
  const stats = {
    total: activeTickets.length,
    hotFixes: activeTickets.filter(t => t.type === 'hot_fix').length,
    bugs: activeTickets.filter(t => t.type === 'bug_report').length,
    features: activeTickets.filter(t => t.type === 'fixed_scope').length,
    errors: tickets.filter(t => t.type === 'error').length,
    drafts: draftTickets.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeView={activeView}
        onViewChange={handleViewChange}
        notificationCount={notifications.length}
        draftCount={stats.drafts}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {viewState === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">
                  Nuevo Ticket
                </h2>
                <p className="text-muted-foreground">
                  Describe tu necesidad y nuestro sistema la clasificará automáticamente
                </p>
              </div>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <TicketForm onSubmit={handleSubmit} isLoading={isProcessing} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {viewState === 'result' && lastCreatedTicket && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg mx-auto"
            >
              <ClassificationResult
                ticket={lastCreatedTicket}
                onContinue={handleContinueFromResult}
              />
            </motion.div>
          )}

          {viewState === 'approvals' && (
            <motion.div
              key="approvals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ApprovalBoard
                tickets={tickets}
                onApprove={approveTicket}
                onReject={rejectTicket}
                onEdit={handleEditTicket}
                onDelete={deleteTicket}
              />
            </motion.div>
          )}

          {viewState === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Zap className="h-4 w-4 text-status-today" />
                      Hot Fixes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-status-today">{stats.hotFixes}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-status-week" />
                      Bugs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-status-week">{stats.bugs}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Layers className="h-4 w-4 text-primary" />
                      Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{stats.features}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-status-error" />
                      Errores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-status-error">{stats.errors}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <FileEdit className="h-4 w-4 text-muted-foreground" />
                      Borradores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.drafts}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    Tabla de Seguimiento
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Gestiona y da seguimiento a todos los tickets
                  </p>
                </div>
                <button
                  onClick={() => handleViewChange('form')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Ticket
                </button>
              </div>

              {/* Tickets as Cards (mobile) */}
              <div className="lg:hidden space-y-4 mb-8">
                {activeTickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                    onEdit={handleEditTicket}
                    onLinkCard={(id) => {
                      const t = tickets.find(x => x.id === id);
                      if (t) {
                        setEditingTicket(t);
                        setShowEditDialog(true);
                      }
                    }}
                    onClose={handleCloseTicket}
                  />
                ))}
              </div>

              {/* Table (desktop) */}
              <div className="hidden lg:block">
                <TrackingTable
                  tickets={activeTickets}
                  onTicketClick={(ticket) => {
                    if (ticket.type === 'error') {
                      handleEditTicket(ticket.id);
                    }
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Edit Dialog */}
      <EditTicketDialog
        ticket={editingTicket}
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingTicket(null);
        }}
        onResubmit={handleResubmit}
        onLinkCard={handleLinkCard}
        onCloseTicket={handleCloseTicket}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default Index;
