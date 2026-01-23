import { useState } from 'react';
import { X, Link as LinkIcon, RefreshCw } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicketForm } from '@/components/TicketForm';
import { Ticket, TicketFormData } from '@/types/ticket';

interface EditTicketDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
  onResubmit: (ticketId: string, formData: TicketFormData) => Promise<void>;
  onLinkCard: (ticketId: string, cardId: string) => void;
  onCloseTicket: (ticketId: string) => void;
  isLoading?: boolean;
}

export function EditTicketDialog({
  ticket,
  open,
  onClose,
  onResubmit,
  onLinkCard,
  onCloseTicket,
  isLoading,
}: EditTicketDialogProps) {
  const [cardId, setCardId] = useState('');

  if (!ticket) return null;

  const handleResubmit = async (formData: TicketFormData) => {
    await onResubmit(ticket.id, formData);
    onClose();
  };

  const handleLinkCard = () => {
    if (cardId.trim()) {
      onLinkCard(ticket.id, cardId.trim());
      onClose();
    }
  };

  const handleClose = () => {
    onCloseTicket(ticket.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Resolver Ticket con Error
          </DialogTitle>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700">
            <strong>Razón del error:</strong> {ticket.classification.reasoning}
          </p>
        </div>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit" className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Editar y Re-enviar
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-1">
              <LinkIcon className="h-4 w-4" />
              Vincular Card
            </TabsTrigger>
            <TabsTrigger value="close" className="gap-1">
              <X className="h-4 w-4" />
              Cerrar Caso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Edita la información del formulario original y vuelve a enviar el ticket para una nueva clasificación.
            </p>
            <TicketForm
              onSubmit={handleResubmit}
              isLoading={isLoading}
              initialData={ticket.formData}
            />
          </TabsContent>

          <TabsContent value="link" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Si ya existe una Card en Basecamp relacionada, puedes vincularla manualmente para actualizar la tabla de seguimiento.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="cardId">ID de la Card en Basecamp</Label>
              <Input
                id="cardId"
                placeholder="Ej: CARD-12345"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleLinkCard} 
              disabled={!cardId.trim()}
              className="w-full"
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Vincular Card
            </Button>
          </TabsContent>

          <TabsContent value="close" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Si el ticket ya no es relevante o fue resuelto de otra manera, puedes cerrar el caso sin crear una Card.
            </p>
            
            <Button 
              variant="destructive" 
              onClick={handleClose}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Cerrar Caso Definitivamente
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
