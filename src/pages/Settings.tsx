import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Mail, Calendar, Loader2, Link2, CheckCircle, AlertCircle, ExternalLink, Unlink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
<<<<<<< HEAD
import { BasecampConnectionCard } from '@/components/BasecampConnectionCard';
=======
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
>>>>>>> 3e3c5f7eb258b22c1711877e5d520a0eca8b636a
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Settings() {
  const { user, role, isLoading, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnectingBasecamp, setIsConnectingBasecamp] = useState(false);
  const [isDisconnectingBasecamp, setIsDisconnectingBasecamp] = useState(false);
  const [basecampStatus, setBasecampStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [isCheckingBasecamp, setIsCheckingBasecamp] = useState(true);

  const handleDisconnectBasecamp = async () => {
    setIsDisconnectingBasecamp(true);
    try {
      const { data, error } = await supabase.functions.invoke('basecamp-disconnect', {
        method: 'DELETE',
      });

      if (error) {
        throw new Error(error.message || 'Error al desconectar');
      }

      toast.success('✅ Basecamp desconectado correctamente');
      setBasecampStatus('disconnected');
    } catch (err) {
      console.error('Basecamp disconnect error:', err);
      toast.error(err instanceof Error ? err.message : 'Error al desconectar Basecamp');
    } finally {
      setIsDisconnectingBasecamp(false);
    }
  };

  // Check URL params for Basecamp connection status
  useEffect(() => {
    const basecampParam = searchParams.get('basecamp');
    const errorParam = searchParams.get('error');

    if (basecampParam === 'connected') {
      toast.success('✅ Basecamp conectado correctamente');
      setBasecampStatus('connected');
      // Clean up URL
      setSearchParams({});
    } else if (errorParam) {
      toast.error(`Error: ${decodeURIComponent(errorParam)}`);
      // Clean up URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Check Basecamp connection status on mount
  useEffect(() => {
    const checkBasecampStatus = async () => {
      if (!isAdmin) {
        setIsCheckingBasecamp(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('basecamp_tokens')
          .select('expires_at')
          .eq('id', 'system')
          .maybeSingle();

        if (error) {
          if (import.meta.env.DEV) console.error('Error checking Basecamp status:', error);
          setBasecampStatus('disconnected');
        } else if (data) {
          // Check if token is not expired
          const isExpired = new Date(data.expires_at) < new Date();
          setBasecampStatus(isExpired ? 'disconnected' : 'connected');
        } else {
          setBasecampStatus('disconnected');
        }
      } catch (err) {
        console.error('Error checking Basecamp:', err);
        setBasecampStatus('disconnected');
      } finally {
        setIsCheckingBasecamp(false);
      }
    };

    checkBasecampStatus();
  }, [isAdmin]);

  const handleConnectBasecamp = async () => {
    setIsConnectingBasecamp(true);
    try {
      const { data, error } = await supabase.functions.invoke('basecamp-auth', {
        body: { returnUrl: '/settings' },
      });

      if (error) {
        throw new Error(error.message || 'Error al iniciar conexión');
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de autenticación');
      }
    } catch (err) {
      console.error('Basecamp connect error:', err);
      toast.error(err instanceof Error ? err.message : 'Error al conectar con Basecamp');
      setIsConnectingBasecamp(false);
    }
  };

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

<<<<<<< HEAD
        {/* Basecamp Connection Card */}
        <BasecampConnectionCard />
=======
        {/* Basecamp Integration Card - Admin Only */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Integración Basecamp
              </CardTitle>
              <CardDescription>
                Conecta tu cuenta de Basecamp para sincronizar tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isCheckingBasecamp ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Verificando conexión...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {basecampStatus === 'connected' ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-primary">Conectado</p>
                            <p className="text-sm text-muted-foreground">
                              Los tickets aprobados se sincronizarán automáticamente
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-warning" />
                          <div>
                            <p className="font-medium text-warning">No conectado</p>
                            <p className="text-sm text-muted-foreground">
                              Conecta tu cuenta para habilitar la sincronización
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleConnectBasecamp}
                      disabled={isConnectingBasecamp || isDisconnectingBasecamp}
                      variant={basecampStatus === 'connected' ? 'outline' : 'default'}
                    >
                      {isConnectingBasecamp ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Conectando...
                        </>
                      ) : basecampStatus === 'connected' ? (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Reconectar
                        </>
                      ) : (
                        <>
                          <Link2 className="mr-2 h-4 w-4" />
                          Conectar con Basecamp
                        </>
                      )}
                    </Button>

                    {basecampStatus === 'connected' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            disabled={isDisconnectingBasecamp}
                          >
                            {isDisconnectingBasecamp ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Desconectando...
                              </>
                            ) : (
                              <>
                                <Unlink className="mr-2 h-4 w-4" />
                                Desconectar
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Desconectar Basecamp?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esto eliminará la conexión con Basecamp. Los tickets que ya fueron sincronizados 
                              permanecerán en Basecamp, pero los nuevos tickets no se sincronizarán hasta que 
                              vuelvas a conectar.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDisconnectBasecamp}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Sí, desconectar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Al conectar, autorizas a la aplicación a crear cards en tu proyecto de Basecamp.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
>>>>>>> 3e3c5f7eb258b22c1711877e5d520a0eca8b636a
      </div>
    </motion.div>
  );
}
