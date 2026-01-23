import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, isBefore, isToday, startOfDay } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { CalendarIcon, Send, Loader2, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { TicketFormData } from '@/types/ticket';
import { useLanguage } from '@/contexts/LanguageContext';
import { AttachmentInput, Attachment } from '@/components/AttachmentInput';
import { TicketTypeHelper } from '@/components/TicketTypeHelper';

const MAX_NEED_CHARS = 1000;
const MAX_FLOW_CHARS = 2000;
const MAX_CONTEXT_CHARS = 2000;

interface TicketFormProps {
  onSubmit: (data: TicketFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: TicketFormData;
}

export function TicketForm({ onSubmit, isLoading, initialData }: TicketFormProps) {
  const { t, language } = useLanguage();
  const [dateError, setDateError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments || []);

  const getDateLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'pt-BR': return ptBR;
      default: return es;
    }
  };

  const formSchema = z.object({
    need: z.string()
      .min(20, t('validation.need.min'))
      .max(MAX_NEED_CHARS),
    desiredFlow: z.string()
      .min(15, t('validation.desiredFlow.min'))
      .max(MAX_FLOW_CHARS),
    context: z.string()
      .min(10, t('validation.context.min'))
      .max(MAX_CONTEXT_CHARS),
    desiredDate: z.date({
      required_error: t('validation.date.required'),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      need: initialData?.need || '',
      desiredFlow: initialData?.desiredFlow || '',
      context: initialData?.context || '',
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
      setDateError(t('form.desiredDate.error'));
      return;
    }
    
    form.setValue('desiredDate', date, { shouldValidate: true });
  };

  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      need: values.need.trim(),
      desiredFlow: values.desiredFlow.trim(),
      context: values.context.trim(),
      desiredDate: values.desiredDate,
      attachments,
    });
  };

  const selectedDate = form.watch('desiredDate');

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Helper */}
      <TicketTypeHelper />
      
      <div className="form-section">
        <Label htmlFor="need" className="text-base font-medium">
          {t('form.need.label')}
        </Label>
        <Textarea
          id="need"
          placeholder={t('form.need.placeholder')}
          className="mt-2 min-h-[100px] resize-none"
          maxLength={MAX_NEED_CHARS}
          {...form.register('need')}
        />
        {form.formState.errors.need && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.need.message}</p>
        )}
        <p className="hint">{t('form.need.hint')}</p>
      </div>

      <div className="form-section">
        <Label htmlFor="desiredFlow" className="text-base font-medium">
          {t('form.desiredFlow.label')}
        </Label>
        <Textarea
          id="desiredFlow"
          placeholder={t('form.desiredFlow.placeholder')}
          className="mt-2 min-h-[120px] resize-none"
          maxLength={MAX_FLOW_CHARS}
          {...form.register('desiredFlow')}
        />
        {form.formState.errors.desiredFlow && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.desiredFlow.message}</p>
        )}
        <p className="hint">{t('form.desiredFlow.hint')}</p>
      </div>

      <div className="form-section">
        <Label htmlFor="context" className="text-base font-medium">
          {t('form.context.label')}
        </Label>
        <Textarea
          id="context"
          placeholder={t('form.context.placeholder')}
          className="mt-2 min-h-[100px] resize-none"
          maxLength={MAX_CONTEXT_CHARS}
          {...form.register('context')}
        />
        {form.formState.errors.context && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.context.message}</p>
        )}
        <p className="hint">{t('form.context.hint')}</p>
      </div>

      {/* Attachments */}
      <div className="form-section">
        <AttachmentInput attachments={attachments} onChange={setAttachments} />
      </div>

      <div className="form-section">
        <Label className="text-base font-medium">{t('form.desiredDate.label')}</Label>
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
                format(selectedDate, "PPP", { locale: getDateLocale() })
              ) : (
                <span>{t('form.desiredDate.placeholder')}</span>
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
              locale={getDateLocale()}
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
        <p className="hint">{t('form.desiredDate.hint')}</p>
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
            {t('form.submitting')}
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            {t('form.submit')}
          </>
        )}
      </Button>
    </form>
  );
}
