import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, isBefore, isToday, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Send, Loader2, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { TicketFormData, Priority, PRIORITY_CONFIG } from '@/types/ticket';

const formSchema = z.object({
  need: z.string()
    .min(20, 'Describe tu necesidad en al menos 20 caracteres')
    .max(500, 'Máximo 500 caracteres'),
  desiredFlow: z.string()
    .min(15, 'Describe el flujo deseado en al menos 15 caracteres')
    .max(1000, 'Máximo 1000 caracteres'),
  context: z.string()
    .min(10, 'Proporciona contexto en al menos 10 caracteres')
    .max(1500, 'Máximo 1500 caracteres'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  desiredDate: z.date({
    required_error: 'Selecciona una fecha',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TicketFormProps {
  onSubmit: (data: TicketFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: TicketFormData;
}

export function TicketForm({ onSubmit, isLoading, initialData }: TicketFormProps) {
  const [dateError, setDateError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      need: initialData?.need || '',
      desiredFlow: initialData?.desiredFlow || '',
      context: initialData?.context || '',
      priority: initialData?.priority || 'medium',
      desiredDate: initialData?.desiredDate || undefined,
    },
  });

  const tomorrow = addDays(new Date(), 1);

  const handleDateSelect = (date: Date | undefined) => {
    setDateError(null);
    
    if (!date) return;
    
    const today = startOfDay(new Date());
    const selectedDate = startOfDay(date);
    
    if (isBefore(selectedDate, today) || isToday(date)) {
      setDateError('No se permiten fechas pasadas ni la fecha de hoy. Selecciona una fecha futura.');
      return;
    }
    
    form.setValue('desiredDate', date, { shouldValidate: true });
  };

  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      need: values.need.trim(),
      desiredFlow: values.desiredFlow.trim(),
      context: values.context.trim(),
      priority: values.priority as Priority,
      desiredDate: values.desiredDate,
    });
  };

  const selectedDate = form.watch('desiredDate');

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="form-section">
        <Label htmlFor="need" className="text-base font-medium">
          ¿Cuál es tu necesidad?
        </Label>
        <Textarea
          id="need"
          placeholder="Describe qué necesitas de manera clara y detallada..."
          className="mt-2 min-h-[100px] resize-none"
          {...form.register('need')}
        />
        {form.formState.errors.need && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.need.message}</p>
        )}
        <p className="hint">Sé específico sobre el problema o funcionalidad que requieres</p>
      </div>

      <div className="form-section">
        <Label htmlFor="desiredFlow" className="text-base font-medium">
          ¿Cuál es el flujo deseado?
        </Label>
        <Textarea
          id="desiredFlow"
          placeholder="Describe paso a paso cómo debería funcionar..."
          className="mt-2 min-h-[120px] resize-none"
          {...form.register('desiredFlow')}
        />
        {form.formState.errors.desiredFlow && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.desiredFlow.message}</p>
        )}
        <p className="hint">Enumera los pasos del proceso ideal que esperas</p>
      </div>

      <div className="form-section">
        <Label htmlFor="context" className="text-base font-medium">
          Danos un poco de contexto
        </Label>
        <Textarea
          id="context"
          placeholder="¿Por qué es importante? ¿Quiénes se ven afectados? ¿Hay urgencia?"
          className="mt-2 min-h-[100px] resize-none"
          {...form.register('context')}
        />
        {form.formState.errors.context && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.context.message}</p>
        )}
        <p className="hint">Incluye impacto en el negocio, usuarios afectados o dependencias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-section">
          <Label className="text-base font-medium">Prioridad</Label>
          <Select
            value={form.watch('priority')}
            onValueChange={(value) => form.setValue('priority', value as Priority)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecciona la prioridad" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <span className={cn('inline-flex items-center gap-2')}>
                    <span className={cn('w-2 h-2 rounded-full', 
                      key === 'low' && 'bg-slate-400',
                      key === 'medium' && 'bg-blue-500',
                      key === 'high' && 'bg-amber-500',
                      key === 'critical' && 'bg-red-500',
                    )} />
                    {config.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="form-section">
          <Label className="text-base font-medium">Tiempo deseado de entrega</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'mt-2 w-full justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: es })
                ) : (
                  <span>Selecciona una fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => isBefore(date, tomorrow)}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
          {form.formState.errors.desiredDate && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.desiredDate.message}</p>
          )}
          {dateError && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{dateError}</AlertDescription>
            </Alert>
          )}
          <p className="hint">Solo se permiten fechas a partir de mañana</p>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando ticket...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Enviar Ticket
          </>
        )}
      </Button>
    </form>
  );
}
