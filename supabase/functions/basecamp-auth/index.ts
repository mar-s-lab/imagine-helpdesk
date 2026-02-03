<<<<<<< HEAD
// Basecamp OAuth Initiation Edge Function
// Redirects user to Basecamp authorization page

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCorsPreFlight, createErrorResponse } from '../_shared/cors.ts';

const BASECAMP_AUTH_URL = 'https://launchpad.37signals.com/authorization/new';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight();
  }

  try {
    // Get Basecamp OAuth credentials from environment
    const clientId = Deno.env.get('BASECAMP_CLIENT_ID');
    const redirectUri = Deno.env.get('BASECAMP_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      return createErrorResponse(
        'Basecamp OAuth not configured. Admin must set BASECAMP_CLIENT_ID and BASECAMP_REDIRECT_URI.',
        500
      );
    }

    // Get authorization header to verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse('Missing authorization header', 401);
    }

    // Create Supabase client to verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Generate state parameter for CSRF protection (includes user ID)
    const state = btoa(JSON.stringify({
      userId: user.id,
      timestamp: Date.now(),
      nonce: crypto.randomUUID(),
    }));

    // Build authorization URL
    const authUrl = new URL(BASECAMP_AUTH_URL);
    authUrl.searchParams.set('type', 'web_server');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    // Return the authorization URL for the frontend to redirect
    return new Response(JSON.stringify({
      authUrl: authUrl.toString(),
      state,
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error initiating Basecamp OAuth:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
=======
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getCorsHeaders,
  createCorsPreflightResponse,
  createJsonResponse,
  logInfo,
  logError,
} from "../_shared/cors.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return createCorsPreflightResponse(origin);
  }

  try {
    const clientId = Deno.env.get("BASECAMP_CLIENT_ID")?.trim();

    if (!clientId) {
      logError("basecamp_auth_init", new Error("Missing Basecamp OAuth configuration"));
      return createJsonResponse(
        { error: "Basecamp OAuth not configured" },
        500,
        origin
      );
    }

    // Get the redirect URL from body (POST) or query params
    const url = new URL(req.url);
    let body: { returnUrl?: string } = {};
    try {
      if (req.method === "POST") {
        body = await req.json();
      }
    } catch {
      // Ignore JSON parse errors
    }
    const returnUrl = body.returnUrl || url.searchParams.get("returnUrl") || "/";
    
    // Validate returnUrl to prevent open redirects - only allow relative paths
    const sanitizedReturnUrl = returnUrl.startsWith("/") && !returnUrl.startsWith("//") 
      ? returnUrl 
      : "/";
    
    // Generate a random state for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state and returnUrl in a cookie-like format encoded in state
    const stateData = btoa(JSON.stringify({ state, returnUrl: sanitizedReturnUrl }));

    // Build the Basecamp OAuth authorization URL
    const authUrl = new URL("https://launchpad.37signals.com/authorization/new");
    authUrl.searchParams.set("type", "web_server");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", `${Deno.env.get("SUPABASE_URL")}/functions/v1/basecamp-callback`);
    authUrl.searchParams.set("state", stateData);

    logInfo("basecamp_auth_redirect", {
      returnUrl: sanitizedReturnUrl,
    });

    return createJsonResponse(
      { url: authUrl.toString() },
      200,
      origin
    );
  } catch (error: unknown) {
    logError("basecamp_auth_error", error);
    return createJsonResponse(
      { error: "Authentication initialization failed" },
      500,
      origin
    );
>>>>>>> 3e3c5f7eb258b22c1711877e5d520a0eca8b636a
  }
});
