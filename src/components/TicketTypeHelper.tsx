import { Zap, Bug, Layers, HelpCircle } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export function TicketTypeHelper() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const types = [
    {
      icon: Zap,
      title: t('helper.hotfix.title'),
      desc: t('helper.hotfix.desc'),
      color: 'text-red-600 bg-red-50',
      iconColor: 'text-red-500',
      badge: '< 24h',
    },
    {
      icon: Bug,
      title: t('helper.bug.title'),
      desc: t('helper.bug.desc'),
      color: 'text-amber-700 bg-amber-50',
      iconColor: 'text-amber-500',
      badge: '1-2 days',
    },
    {
      icon: Layers,
      title: t('helper.feature.title'),
      desc: t('helper.feature.desc'),
      color: 'text-primary bg-primary/5',
      iconColor: 'text-primary',
      badge: 'Scheduled',
    },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2">
        <HelpCircle className="h-4 w-4" />
        <span>{t('helper.title')}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <div className="grid gap-3">
          {types.map((type) => (
            <div
              key={type.title}
              className={`flex items-start gap-3 p-4 rounded-lg border ${type.color}`}
            >
              <type.icon className={`h-5 w-5 mt-0.5 shrink-0 ${type.iconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{type.title}</span>
                  <span className="text-xs px-2 py-0.5 bg-background/80 rounded-full font-medium">
                    {type.badge}
                  </span>
                </div>
                <p className="text-sm opacity-90">{type.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
