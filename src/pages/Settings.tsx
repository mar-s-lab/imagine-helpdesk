import { motion } from 'framer-motion';
import { User, Shield, Mail, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Settings() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const roleConfig = {
    admin: {
      label: 'Administrador',
      description: 'Acceso completo al sistema incluyendo aprobaciones',
      variant: 'default' as const,
    },
    user: {
      label: 'Usuario',
      description: 'Acceso a nuevos tickets y seguimiento',
      variant: 'secondary' as const,
    },
  };

  const currentRole = role ? roleConfig[role] : roleConfig.user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">
          Configuración
        </h2>
        <p className="text-muted-foreground">
          Información de tu cuenta y permisos
        </p>
      </div>

      <div className="space-y-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil de usuario
            </CardTitle>
            <CardDescription>
              Tu información personal y de acceso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg">
                  {user?.user_metadata?.full_name || 'Usuario'}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">ID de usuario</p>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded truncate">
                  {user?.id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Fecha de registro</p>
                <p className="text-sm flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {user?.created_at 
                    ? format(new Date(user.created_at), "d 'de' MMMM, yyyy", { locale: es })
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Rol y permisos
            </CardTitle>
            <CardDescription>
              Tu nivel de acceso en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tu rol actual</p>
                <p className="text-sm text-muted-foreground">{currentRole.description}</p>
              </div>
              <Badge variant={currentRole.variant} className="text-sm px-3 py-1">
                {currentRole.label}
              </Badge>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-3">Permisos de acceso</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Nuevos tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Seguimiento de tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-primary' : 'bg-muted'}`} />
                  <span className={`text-sm ${role !== 'admin' ? 'text-muted-foreground' : ''}`}>
                    Aprobaciones
                    {role !== 'admin' && ' (solo administradores)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Notificaciones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Configuración</span>
                </div>
              </div>
            </div>

            {role !== 'admin' && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Para solicitar permisos de administrador, contacta a un administrador del sistema.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
