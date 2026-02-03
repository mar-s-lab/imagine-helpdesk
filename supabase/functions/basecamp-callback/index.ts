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
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
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
      },
    });

    if (!authInfoResponse.ok) {
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
  }
});
