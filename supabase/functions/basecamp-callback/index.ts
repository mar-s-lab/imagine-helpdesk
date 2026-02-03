<<<<<<< HEAD
// Basecamp OAuth Callback Edge Function
// Exchanges authorization code for access token and stores it

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BASECAMP_TOKEN_URL = 'https://launchpad.37signals.com/authorization/token';
const BASECAMP_AUTH_INFO_URL = 'https://launchpad.37signals.com/authorization.json';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthorizationInfo {
  expires_at: string;
  identity: {
    id: number;
    first_name: string;
    last_name: string;
    email_address: string;
  };
  accounts: Array<{
    id: number;
    name: string;
    product: string;
    href: string;
  }>;
}

Deno.serve(async (req) => {
  // This endpoint handles the OAuth callback redirect from Basecamp
  // It will be called with ?code=xxx&state=xxx

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Get app URL for redirects
  const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';

  // Handle OAuth errors
  if (error) {
    console.error('Basecamp OAuth error:', error);
    return Response.redirect(`${appUrl}/settings?basecamp_error=${encodeURIComponent(error)}`, 302);
  }

  if (!code || !state) {
    return Response.redirect(`${appUrl}/settings?basecamp_error=missing_params`, 302);
  }

  try {
    // Decode and validate state
    let stateData: { userId: string; timestamp: number; nonce: string };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return Response.redirect(`${appUrl}/settings?basecamp_error=invalid_state`, 302);
    }

    // Check state is not too old (5 minutes max)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return Response.redirect(`${appUrl}/settings?basecamp_error=state_expired`, 302);
    }

    // Get OAuth credentials
    const clientId = Deno.env.get('BASECAMP_CLIENT_ID');
    const clientSecret = Deno.env.get('BASECAMP_CLIENT_SECRET');
    const redirectUri = Deno.env.get('BASECAMP_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      return Response.redirect(`${appUrl}/settings?basecamp_error=not_configured`, 302);
    }

    // Exchange code for token
    const tokenUrl = new URL(BASECAMP_TOKEN_URL);
    tokenUrl.searchParams.set('type', 'web_server');
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
=======
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getCorsHeaders,
  createCorsPreflightResponse,
  createRedirectResponse,
  getFrontendUrl,
  logInfo,
  logError,
  logWarn,
} from "../_shared/cors.ts";

serve(async (req) => {
  // Log immediately to confirm function execution
  logInfo("basecamp_callback_received", {
    method: req.method,
    url: req.url,
  });

  const origin = req.headers.get("origin") || req.headers.get("referer");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return createCorsPreflightResponse(origin);
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Log all received parameters for debugging
    logInfo("basecamp_callback_params", {
      hasCode: !!code,
      hasState: !!stateParam,
      error: error || null,
    });

    // Determine frontend URL for redirects
    let frontendUrl = getFrontendUrl(origin);

    // Handle errors from Basecamp
    if (error) {
      logError("basecamp_oauth_error", new Error(error));
      return createRedirectResponse(
        `${frontendUrl}/settings?error=${encodeURIComponent(error)}`,
        origin
      );
    }

    if (!code || !stateParam) {
      logError("basecamp_callback_missing_params", new Error("Missing code or state"));
      return createRedirectResponse(
        `${frontendUrl}/settings?error=${encodeURIComponent("Missing authorization code")}`,
        origin
      );
    }

    // Validate and decode state
    let stateData: { state: string; returnUrl: string };
    try {
      stateData = JSON.parse(atob(stateParam));
      
      // Validate UUID format for state
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(stateData.state)) {
        throw new Error("Invalid state format");
      }
    } catch {
      logError("basecamp_callback_invalid_state", new Error("Invalid state parameter"));
      return createRedirectResponse(
        `${frontendUrl}/settings?error=${encodeURIComponent("Invalid state parameter")}`,
        origin
      );
    }

    const clientId = Deno.env.get("BASECAMP_CLIENT_ID")?.trim();
    const clientSecret = Deno.env.get("BASECAMP_CLIENT_SECRET")?.trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!clientId || !clientSecret || !supabaseUrl || !supabaseServiceKey) {
      logError("basecamp_callback_config_error", new Error("Missing configuration"));
      return createRedirectResponse(
        `${frontendUrl}/settings?error=${encodeURIComponent("Server configuration error")}`,
        origin
      );
    }

    // Exchange code for access token
    logInfo("basecamp_token_exchange_start", {});
    
    const tokenResponse = await fetch("https://launchpad.37signals.com/authorization/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        type: "web_server",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${supabaseUrl}/functions/v1/basecamp-callback`,
        code: code,
      }),
>>>>>>> 3e3c5f7eb258b22c1711877e5d520a0eca8b636a
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
<<<<<<< HEAD
      console.error('Token exchange failed:', errorText);
      return Response.redirect(`${appUrl}/settings?basecamp_error=token_exchange_failed`, 302);
    }

    const tokenData: TokenResponse = await tokenResponse.json();

    // Get authorization info to find the Basecamp account ID
    const authInfoResponse = await fetch(BASECAMP_AUTH_INFO_URL, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'ImagineHelpDesk (support@imagineapps.co)',
=======
      logError("basecamp_token_exchange_failed", new Error(errorText), {
        status: tokenResponse.status,
      });
      return createRedirectResponse(
        `${frontendUrl}/settings?error=${encodeURIComponent("Failed to exchange authorization code")}`,
        origin
      );
    }

    const tokenData = await tokenResponse.json();
    logInfo("basecamp_token_exchange_success", {});

    // Get user authorization info to find their accounts
    const authInfoResponse = await fetch("https://launchpad.37signals.com/authorization.json", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
>>>>>>> 3e3c5f7eb258b22c1711877e5d520a0eca8b636a
      },
    });

    if (!authInfoResponse.ok) {
<<<<<<< HEAD
      console.error('Failed to get auth info');
      return Response.redirect(`${appUrl}/settings?basecamp_error=auth_info_failed`, 302);
    }

    const authInfo: AuthorizationInfo = await authInfoResponse.json();

    // Find Basecamp 3/4 account (filter for bc3 product)
    const basecampAccount = authInfo.accounts.find(
      (acc) => acc.product === 'bc3' || acc.product === 'bc4'
    );

    if (!basecampAccount) {
      return Response.redirect(`${appUrl}/settings?basecamp_error=no_basecamp_account`, 302);
    }

    // Create Supabase admin client to store tokens
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // Store/update tokens in database
    const { error: upsertError } = await supabase
      .from('basecamp_tokens')
      .upsert({
        user_id: stateData.userId,
        account_id: basecampAccount.id.toString(),
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Failed to store tokens:', upsertError);
      return Response.redirect(`${appUrl}/settings?basecamp_error=storage_failed`, 302);
    }

    // Success! Redirect back to settings with success message
    return Response.redirect(`${appUrl}/settings?basecamp_connected=true&account=${encodeURIComponent(basecampAccount.name)}`, 302);

  } catch (error) {
    console.error('OAuth callback error:', error);
    return Response.redirect(`${appUrl}/settings?basecamp_error=unknown`, 302);
=======
      logWarn("basecamp_auth_info_failed", { status: authInfoResponse.status });
    }

    const authInfo = authInfoResponse.ok ? await authInfoResponse.json() : null;

    // Store the token in database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: dbError } = await supabase
      .from('basecamp_tokens')
      .upsert({
        id: 'system',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + (tokenData.expires_in || 1209600) * 1000).toISOString(),
        identity: authInfo?.identity || null,
        accounts: authInfo?.accounts || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (dbError) {
      logError("basecamp_token_store_failed", dbError);
      return createRedirectResponse(
        `${frontendUrl}/settings?error=${encodeURIComponent("Failed to save Basecamp connection")}`,
        origin
      );
    }

    logInfo("basecamp_connection_success", {
      identity: authInfo?.identity?.email_address,
      accountCount: authInfo?.accounts?.length || 0,
    });

    return createRedirectResponse(
      `${frontendUrl}/settings?basecamp=connected`,
      origin
    );

  } catch (error: unknown) {
    logError("basecamp_callback_exception", error);
    const frontendUrl = getFrontendUrl(origin);
    return createRedirectResponse(
      `${frontendUrl}/settings?error=${encodeURIComponent("Authentication failed")}`,
      origin
    );
>>>>>>> 3e3c5f7eb258b22c1711877e5d520a0eca8b636a
  }
});
