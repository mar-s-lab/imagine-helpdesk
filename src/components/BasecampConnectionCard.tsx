import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Link2Off, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useBasecampConnection } from '@/hooks/useExecutiveSummary';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface ConnectionStatus {
  isConnected: boolean;
  accountId?: string;
  lastUpdated?: string;
}

export function BasecampConnectionCard() {
  const [status, setStatus] = useState<ConnectionStatus>({ isConnected: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const { disconnectBasecamp } = useBasecampConnection();

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();

    // Check for OAuth callback parameters in URL
    const params = new URLSearchParams(window.location.search);
    const basecampConnected = params.get('basecamp_connected');
    const basecampError = params.get('basecamp_error');
    const accountName = params.get('account');

    if (basecampConnected === 'true') {
      toast.success(`Conectado a Basecamp: ${accountName || 'Cuenta vinculada'}`);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      checkConnectionStatus();
    } else if (basecampError) {
      const errorMessages: Record<string, string> = {
        'missing_params': 'Parámetros de autorización faltantes',
        'invalid_state': 'Estado de autorización inválido',
        'state_expired': 'La autorización expiró. Intenta de nuevo.',
        'not_configured': 'Basecamp OAuth no está configurado. Contacta al administrador.',
        'token_exchange_failed': 'Error al obtener el token de acceso',
        'auth_info_failed': 'Error al obtener información de la cuenta',
        'no_basecamp_account': 'No se encontró una cuenta de Basecamp activa',
        'storage_failed': 'Error al guardar las credenciales',
        'unknown': 'Error desconocido. Intenta de nuevo.',
      };
      toast.error(errorMessages[basecampError] || 'Error al conectar con Basecamp');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkConnectionStatus = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('basecamp_tokens')
        .select('account_id, updated_at')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setStatus({
          isConnected: true,
          accountId: data.account_id,
          lastUpdated: data.updated_at,
        });
      } else {
        setStatus({ isConnected: false });
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setStatus({ isConnected: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Debes iniciar sesión para conectar Basecamp');
        return;
      }

      // Get authorization URL from Edge Function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/basecamp-auth`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al iniciar conexión');
      }

      const { authUrl } = await response.json();

      // Redirect to Basecamp authorization
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Basecamp:', error);
      toast.error(error instanceof Error ? error.message : 'Error al conectar con Basecamp');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectBasecamp();
      setStatus({ isConnected: false });
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Error al desconectar');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status.isConnected ? (
              <Link2 className="h-5 w-5 text-green-600" />
            ) : (
              <Link2Off className="h-5 w-5 text-muted-foreground" />
            )}
            Conexión con Basecamp
          </CardTitle>
          <CardDescription>
            Conecta tu cuenta de Basecamp para ver resúmenes ejecutivos de tus proyectos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.isConnected ? (
            <>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-800">Conectado</p>
                  <p className="text-sm text-green-600">
                    Cuenta ID: {status.accountId}
                  </p>
                  {status.lastUpdated && (
                    <p className="text-xs text-green-500 mt-1">
                      Última actualización: {new Date(status.lastUpdated).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Activo
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4 mr-2" />
                  )}
                  Reconectar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                >
                  <Link2Off className="h-4 w-4 mr-2" />
                  Desconectar
                </Button>
              </div>
            </>
          ) : (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Necesitas conectar tu cuenta de Basecamp para acceder a los Resúmenes Ejecutivos.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4 mr-2" />
                  )}
                  Conectar con Basecamp
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Serás redirigido a Basecamp para autorizar el acceso.
                  <br />
                  Solo se solicitan permisos de lectura.
                </p>
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <a
              href="https://3.basecamp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Ir a Basecamp
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
