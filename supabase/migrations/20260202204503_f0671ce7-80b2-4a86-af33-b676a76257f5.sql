-- Create table to store Basecamp OAuth tokens
CREATE TABLE public.basecamp_tokens (
  id TEXT PRIMARY KEY DEFAULT 'system',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  identity JSONB,
  accounts JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.basecamp_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access (no public access)
-- RLS policies will be restrictive - only admins can view/manage tokens

-- Policy: Only admins can view tokens
CREATE POLICY "Admins can view basecamp tokens"
ON public.basecamp_tokens
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Policy: Only admins can insert tokens
CREATE POLICY "Admins can insert basecamp tokens"
ON public.basecamp_tokens
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Policy: Only admins can update tokens
CREATE POLICY "Admins can update basecamp tokens"
ON public.basecamp_tokens
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Policy: Only admins can delete tokens
CREATE POLICY "Admins can delete basecamp tokens"
ON public.basecamp_tokens
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);