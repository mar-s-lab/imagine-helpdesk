-- Create table for Basecamp sync logs
CREATE TABLE public.basecamp_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'retry')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  basecamp_card_id TEXT,
  basecamp_response JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.basecamp_sync_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view sync logs" ON public.basecamp_sync_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- System can insert logs (via service role in edge function)
CREATE POLICY "Service role can insert logs" ON public.basecamp_sync_log
  FOR INSERT WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_sync_log_ticket_id ON public.basecamp_sync_log(ticket_id);
CREATE INDEX idx_sync_log_created_at ON public.basecamp_sync_log(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.basecamp_sync_log IS 'Historial de sincronizaciones con Basecamp para auditoría y debugging';