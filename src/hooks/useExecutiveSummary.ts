import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BasecampProject, ExecutiveSummary } from '@/types/executive-summary';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No active session');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

async function fetchProjects(): Promise<BasecampProject[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/basecamp-projects`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch projects');
  }

  return response.json();
}

async function fetchExecutiveSummary(projectId: number): Promise<ExecutiveSummary> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/basecamp-executive-summary?projectId=${projectId}`,
    { headers }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch executive summary');
  }

  return response.json();
}

export function useBasecampProjects() {
  return useQuery({
    queryKey: ['basecamp-projects'],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useExecutiveSummary(projectId: number | null) {
  return useQuery({
    queryKey: ['executive-summary', projectId],
    queryFn: () => {
      if (!projectId) throw new Error('No project selected');
      return fetchExecutiveSummary(projectId);
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

export function useExecutiveSummaryActions() {
  const queryClient = useQueryClient();

  const refreshProjects = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['basecamp-projects'] });
    toast.info('Actualizando lista de proyectos...');
  }, [queryClient]);

  const refreshSummary = useCallback((projectId: number) => {
    queryClient.invalidateQueries({ queryKey: ['executive-summary', projectId] });
    toast.info('Actualizando resumen ejecutivo...');
  }, [queryClient]);

  return {
    refreshProjects,
    refreshSummary,
  };
}

// Hook for managing Basecamp connection status
export function useBasecampConnection() {
  const [isConnecting, setIsConnecting] = useState(false);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('basecamp_tokens')
        .select('account_id')
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }, []);

  const saveCredentials = useCallback(async (accountId: string, accessToken: string) => {
    setIsConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('basecamp_tokens')
        .upsert({
          user_id: user.id,
          account_id: accountId,
          access_token: accessToken,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast.success('Conexión con Basecamp guardada');
      return true;
    } catch (error) {
      toast.error('Error al guardar las credenciales de Basecamp');
      console.error('Error saving Basecamp credentials:', error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectBasecamp = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('basecamp_tokens')
        .delete()
        .eq('user_id', user.id);

      toast.info('Desconectado de Basecamp');
    } catch (error) {
      console.error('Error disconnecting Basecamp:', error);
    }
  }, []);

  return {
    isConnecting,
    checkConnection,
    saveCredentials,
    disconnectBasecamp,
  };
}
