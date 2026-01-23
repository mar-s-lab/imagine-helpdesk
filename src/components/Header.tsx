import { Ticket, LayoutDashboard, Bell, Settings, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  activeView: 'form' | 'table' | 'approvals';
  onViewChange: (view: 'form' | 'table' | 'approvals') => void;
  notificationCount?: number;
  draftCount?: number;
}

export function Header({ activeView, onViewChange, notificationCount = 0, draftCount = 0 }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Ticket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold text-foreground">
                {t('header.title')}
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Button
              variant={activeView === 'form' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('form')}
              className="gap-2"
            >
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">{t('header.newTicket')}</span>
            </Button>
            <Button
              variant={activeView === 'approvals' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('approvals')}
              className="gap-2 relative"
            >
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">{t('header.approvals')}</span>
              {draftCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                >
                  {draftCount > 9 ? '9+' : draftCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeView === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('table')}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">{t('header.tracking')}</span>
            </Button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] font-medium flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
