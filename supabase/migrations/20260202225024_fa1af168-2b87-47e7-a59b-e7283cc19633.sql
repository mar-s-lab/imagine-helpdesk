-- Nueva tabla de tickets con persistencia y tracking de Basecamp
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomenclature TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fixed_scope', 'bug_report', 'hot_fix', 'error')),
  status TEXT NOT NULL DEFAULT 'draft',
  form_data JSONB NOT NULL,
  classification JSONB NOT NULL,
  notes TEXT[] DEFAULT '{}',
  desired_date TIMESTAMP WITH TIME ZONE,
  estimated_deploy_date TIMESTAMP WITH TIME ZONE,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  basecamp_card_id TEXT,
  basecamp_card_url TEXT,
  basecamp_synced BOOLEAN DEFAULT FALSE,
  sync_attempts INTEGER DEFAULT 0,
  last_sync_error TEXT,
  rejection_reason TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view all tickets
CREATE POLICY "Users can view tickets" ON public.tickets
  FOR SELECT TO authenticated
  USING (true);

-- Policy: Users can create tickets assigned to themselves
CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy: Admins can update any ticket
CREATE POLICY "Admins can update tickets" ON public.tickets
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can delete tickets
CREATE POLICY "Admins can delete tickets" ON public.tickets
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tickets_updated_at();

-- Index for faster queries by status
CREATE INDEX idx_tickets_status ON public.tickets(status);

-- Index for faster queries by created_by
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);

-- Index for Basecamp sync tracking
CREATE INDEX idx_tickets_basecamp_synced ON public.tickets(basecamp_synced) WHERE basecamp_synced = false;