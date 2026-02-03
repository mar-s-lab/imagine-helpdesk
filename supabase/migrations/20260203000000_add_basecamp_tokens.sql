-- Create basecamp_tokens table for storing Basecamp OAuth credentials
CREATE TABLE public.basecamp_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    account_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row-Level Security on basecamp_tokens
ALTER TABLE public.basecamp_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for basecamp_tokens table
-- Users can view their own tokens
CREATE POLICY "Users can view their own basecamp tokens"
ON public.basecamp_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own tokens
CREATE POLICY "Users can insert their own basecamp tokens"
ON public.basecamp_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update their own basecamp tokens"
ON public.basecamp_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete their own basecamp tokens"
ON public.basecamp_tokens
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_basecamp_tokens_user_id ON public.basecamp_tokens(user_id);

-- Add comment for documentation
COMMENT ON TABLE public.basecamp_tokens IS 'Stores Basecamp OAuth credentials for each user';
