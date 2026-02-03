// Basecamp Projects Edge Function
// Fetches list of projects from Basecamp API

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCorsPreFlight, createJsonResponse, createErrorResponse } from '../_shared/cors.ts';

const BASECAMP_API_BASE = 'https://3.basecampapi.com';
const USER_AGENT = 'ImagineHelpDesk (support@imagineapps.co)';

interface BasecampProject {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  url: string;
}

async function getBasecampCredentials(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await supabase
    .from('basecamp_tokens')
    .select('account_id, access_token')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('Basecamp credentials not found. Please connect your Basecamp account.');
  }

  return data;
}

async function fetchBasecampProjects(accountId: string, accessToken: string): Promise<BasecampProject[]> {
  const response = await fetch(`${BASECAMP_API_BASE}/${accountId}/projects.json`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Basecamp API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight();
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse('Missing authorization header', 401);
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get Basecamp credentials
    const credentials = await getBasecampCredentials(supabase, user.id);

    // Fetch projects from Basecamp
    const projects = await fetchBasecampProjects(credentials.account_id, credentials.access_token);

    // Filter to only active projects
    const activeProjects = projects.filter((p) => p.status === 'active');

    return createJsonResponse(activeProjects);
  } catch (error) {
    console.error('Error fetching Basecamp projects:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
});
