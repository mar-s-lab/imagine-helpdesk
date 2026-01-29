import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, HelpCircle, MapPin, Users, AlertTriangle, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { TicketFormData, OccurrenceLocation, AffectedParty, UrgencyLevel } from '@/types/ticket';
import { useLanguage } from '@/contexts/LanguageContext';
import { AttachmentInput, Attachment } from '@/components/AttachmentInput';
import { TicketTypeHelper } from '@/components/TicketTypeHelper';
import { Card, CardContent } from '@/components/ui/card';

const MAX_HAPPENING_CHARS = 1500;
const MAX_EXPECTED_CHARS = 1500;
const MAX_CONTEXT_CHARS = 2000;

interface TicketFormProps {
  onSubmit: (data: TicketFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<TicketFormData>;
}

export function TicketForm({ onSubmit, isLoading, initialData }: TicketFormProps) {
  const { t } = useLanguage();
  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments || []);
  const [showOtherLocation, setShowOtherLocation] = useState(initialData?.whereOccurs === 'other');

  const formSchema = z.object({
    whatIsHappening: z.string()
      .min(10, t('validation.whatIsHappening.min'))
      .max(MAX_HAPPENING_CHARS),
    expectedFlow: z.string()
      .min(10, t('validation.expectedFlow.min'))
      .max(MAX_EXPECTED_CHARS),
    whereOccurs: z.enum(['app', 'salesforce', 'web', 'internal_process', 'other'] as const),
    whereOccursOther: z.string().optional(),
    affectedParty: z.enum(['customers', 'internal', 'both'] as const),
    urgency: z.enum(['blocks', 'affects', 'not_urgent'] as const),
    additionalContext: z.string().max(MAX_CONTEXT_CHARS).optional(),
  });

  type FormValues = z.infer<typeof formSchema>;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      whatIsHappening: initialData?.whatIsHappening || '',
      expectedFlow: initialData?.expectedFlow || '',
      whereOccurs: initialData?.whereOccurs || 'app',
      whereOccursOther: initialData?.whereOccursOther || '',
      affectedParty: initialData?.affectedParty || 'customers',
      urgency: initialData?.urgency || 'affects',
      additionalContext: initialData?.additionalContext || '',
    },
  });

  const handleLocationChange = (value: OccurrenceLocation) => {
    form.setValue('whereOccurs', value);
    setShowOtherLocation(value === 'other');
  };

  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      whatIsHappening: values.whatIsHappening.trim(),
      expectedFlow: values.expectedFlow.trim(),
      whereOccurs: values.whereOccurs,
      whereOccursOther: values.whereOccursOther?.trim(),
      affectedParty: values.affectedParty,
      urgency: values.urgency,
      additionalContext: values.additionalContext?.trim(),
      attachments,
    });
  };

  const LocationOptions: { value: OccurrenceLocation; label: string; icon?: string }[] = [
    { value: 'app', label: t('form.location.app') },
    { value: 'salesforce', label: t('form.location.salesforce') },
    { value: 'web', label: t('form.location.web') },
    { value: 'internal_process', label: t('form.location.internalProcess') },
    { value: 'other', label: t('form.location.other') },
  ];

  const AffectedOptions: { value: AffectedParty; label: string }[] = [
    { value: 'customers', label: t('form.affected.customers') },
    { value: 'internal', label: t('form.affected.internal') },
    { value: 'both', label: t('form.affected.both') },
  ];

  const UrgencyOptions: { value: UrgencyLevel; label: string; description: string; color: string }[] = [
    { 
      value: 'blocks', 
      label: t('form.urgency.blocks'), 
      description: t('form.urgency.blocksDesc'),
      color: 'border-destructive bg-destructive/5'
    },
    { 
      value: 'affects', 
      label: t('form.urgency.affects'), 
      description: t('form.urgency.affectsDesc'),
      color: 'border-amber-500 bg-amber-500/5'
    },
    { 
      value: 'not_urgent', 
      label: t('form.urgency.notUrgent'), 
      description: t('form.urgency.notUrgentDesc'),
      color: 'border-muted bg-muted/20'
    },
  ];

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      {/* Helper */}
      <TicketTypeHelper />
      
      {/* Question 1: What's happening */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <HelpCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <Label htmlFor="whatIsHappening" className="text-base font-medium leading-relaxed">
              {t('form.whatIsHappening.label')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t('form.whatIsHappening.hint')}
            </p>
          </div>
        </div>
        <Textarea
          id="whatIsHappening"
          placeholder={t('form.whatIsHappening.placeholder')}
          className="min-h-[120px] resize-none text-base"
          maxLength={MAX_HAPPENING_CHARS}
          {...form.register('whatIsHappening')}
        />
        {form.formState.errors.whatIsHappening && (
          <p className="text-sm text-destructive">{form.formState.errors.whatIsHappening.message}</p>
        )}
      </div>

      {/* Question 2: Expected flow */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <Label htmlFor="expectedFlow" className="text-base font-medium leading-relaxed">
              {t('form.expectedFlow.label')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t('form.expectedFlow.hint')}
            </p>
          </div>
        </div>
        <Textarea
          id="expectedFlow"
          placeholder={t('form.expectedFlow.placeholder')}
          className="min-h-[120px] resize-none text-base"
          maxLength={MAX_EXPECTED_CHARS}
          {...form.register('expectedFlow')}
        />
        {form.formState.errors.expectedFlow && (
          <p className="text-sm text-destructive">{form.formState.errors.expectedFlow.message}</p>
        )}
      </div>

      {/* Question 3: Where does it occur */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <Label className="text-base font-medium leading-relaxed">
              {t('form.whereOccurs.label')}
            </Label>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LocationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleLocationChange(option.value)}
              className={cn(
                "px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left",
                form.watch('whereOccurs') === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary/50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {showOtherLocation && (
          <Input
            placeholder={t('form.whereOccurs.otherPlaceholder')}
            className="mt-2"
            {...form.register('whereOccursOther')}
          />
        )}
      </div>

      {/* Question 4: Who is affected */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <Label className="text-base font-medium leading-relaxed">
              {t('form.affectedParty.label')}
            </Label>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {AffectedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => form.setValue('affectedParty', option.value)}
              className={cn(
                "px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all",
                form.watch('affectedParty') === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:border-primary/50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question 5: Urgency */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <Label className="text-base font-medium leading-relaxed">
              {t('form.urgency.label')}
            </Label>
          </div>
        </div>
        <RadioGroup
          value={form.watch('urgency')}
          onValueChange={(value) => form.setValue('urgency', value as UrgencyLevel)}
          className="space-y-2"
        >
          {UrgencyOptions.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                form.watch('urgency') === option.value
                  ? option.color
                  : "border-border bg-background hover:border-primary/30"
              )}
            >
              <RadioGroupItem value={option.value} className="mt-0.5" />
              <div>
                <span className="font-medium">{option.label}</span>
                <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Question 6: Additional context (optional) */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex items-center justify-center text-xs text-muted-foreground mt-0.5 shrink-0">
            ?
          </div>
          <div>
            <Label htmlFor="additionalContext" className="text-base font-medium leading-relaxed">
              {t('form.additionalContext.label')}
              <span className="text-muted-foreground font-normal ml-2">({t('form.optional')})</span>
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t('form.additionalContext.hint')}
            </p>
          </div>
        </div>
        <Textarea
          id="additionalContext"
          placeholder={t('form.additionalContext.placeholder')}
          className="min-h-[100px] resize-none text-base"
          maxLength={MAX_CONTEXT_CHARS}
          {...form.register('additionalContext')}
        />
      </div>

      {/* Attachments */}
      <div className="space-y-3">
        <AttachmentInput attachments={attachments} onChange={setAttachments} />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full text-base py-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t('form.submitting')}
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            {t('form.submit')}
          </>
        )}
      </Button>
    </form>
  );
}
