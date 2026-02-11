import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - restrict to application domains
const allowedOriginPatterns = [
  /^https:\/\/imagine-helpdesk\.lovable\.app$/,
  /^https:\/\/id-preview--[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && allowedOriginPatterns.some(pattern => pattern.test(origin));
  const allowedOrigin = isAllowed ? origin : 'https://imagine-helpdesk.lovable.app';
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

// Determine the frontend URL based on request origin
function getFrontendUrl(origin: string | null): string {
  if (origin && allowedOriginPatterns.some(pattern => pattern.test(origin))) {
    return origin;
  }
  return 'https://imagine-helpdesk.lovable.app';
}

serve(async (req) => {
  const origin = req.headers.get("origin") || req.headers.get("referer");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Determine frontend URL for redirects
    let frontendUrl = 'https://imagine-helpdesk.lovable.app';
    
    // Try to extract origin from state or referer
    if (origin) {
      frontendUrl = getFrontendUrl(origin);
    }

    // Handle errors from Basecamp
    if (error) {
      console.error("Basecamp OAuth error:", error);
      const errorUrl = `${frontendUrl}/settings?error=${encodeURIComponent(error)}`;
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": errorUrl },
      });
    }

    if (!code || !stateParam) {
      console.error("Missing code or state parameter");
      const errorUrl = `${frontendUrl}/settings?error=${encodeURIComponent("Missing authorization code")}`;
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": errorUrl },
      });
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
      console.error("Invalid state parameter");
      const errorUrl = `${frontendUrl}/settings?error=${encodeURIComponent("Invalid state parameter")}`;
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": errorUrl },
      });
    }

    const clientId = Deno.env.get("BASECAMP_CLIENT_ID")?.trim();
    const clientSecret = Deno.env.get("BASECAMP_CLIENT_SECRET")?.trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!clientId || !clientSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Basecamp or Supabase configuration");
      const errorUrl = `${frontendUrl}/settings?error=${encodeURIComponent("Server configuration error")}`;
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": errorUrl },
      });
    }

    // Exchange code for access token
    console.log("Exchanging code for Basecamp access token");
    
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
      console.error("Token exchange failed:", tokenResponse.status, errorText);
      const errorUrl = `${frontendUrl}/settings?error=${encodeURIComponent("Failed to exchange authorization code")}`;
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": errorUrl },
      });
    }

    const tokenData = await tokenResponse.json();
    console.log("Successfully obtained Basecamp access token");

    // Get user authorization info to find their accounts
    const authInfoResponse = await fetch("https://launchpad.37signals.com/authorization.json", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
      },
    });

    if (!authInfoResponse.ok) {
      console.error("Failed to get authorization info:", authInfoResponse.status);
    }

    const authInfo = authInfoResponse.ok ? await authInfoResponse.json() : null;

    // Store the token in database for the authenticated user
    // For now, we'll store it as a system-wide token
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Upsert into a basecamp_tokens table (we'll need to create this)
    const { error: dbError } = await supabase
      .from('basecamp_tokens')
      .upsert({
        id: 'system', // Single system-wide token
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + (tokenData.expires_in || 1209600) * 1000).toISOString(),
        identity: authInfo?.identity || null,
        accounts: authInfo?.accounts || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (dbError) {
      console.error("Failed to store token:", dbError);
      const errorUrl = `${frontendUrl}/settings?error=${encodeURIComponent("Failed to save Basecamp connection")}`;
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": errorUrl },
      });
    }

    console.log("Basecamp connection successful, redirecting to settings");

    // Redirect back to settings with success
    const successUrl = `${frontendUrl}/settings?basecamp=connected`;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, "Location": successUrl },
    });

  } catch (error: unknown) {
    console.error("Error in basecamp-callback:", error);
    const frontendUrl = getFrontendUrl(origin);
    const errorUrl = `${frontendUrl}/settings?error=${encodeURIComponent("Authentication failed")}`;
    return new Response(null, {
      status: 302,
      headers: { ...getCorsHeaders(origin), "Location": errorUrl },
    });
  }
});
