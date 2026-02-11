import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get("BASECAMP_CLIENT_ID")?.trim();

    if (!clientId) {
      console.error("Missing Basecamp OAuth configuration");
      return new Response(
        JSON.stringify({ error: "Basecamp OAuth not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the redirect URL from query params or use default
    const url = new URL(req.url);
    const returnUrl = url.searchParams.get("returnUrl") || "/";
    
    // Validate returnUrl to prevent open redirects - only allow relative paths
    const sanitizedReturnUrl = returnUrl.startsWith("/") && !returnUrl.startsWith("//") 
      ? returnUrl 
      : "/";
    
    // Generate a random state for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state and returnUrl in a cookie-like format encoded in state
    const stateData = btoa(JSON.stringify({ state, returnUrl: sanitizedReturnUrl }));

    // Build the Basecamp OAuth authorization URL
    // Basecamp uses launchpad.37signals.com for OAuth
    const authUrl = new URL("https://launchpad.37signals.com/authorization/new");
    authUrl.searchParams.set("type", "web_server");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", `${Deno.env.get("SUPABASE_URL")}/functions/v1/basecamp-callback`);
    authUrl.searchParams.set("state", stateData);

    console.log("Redirecting to Basecamp OAuth");

    return new Response(JSON.stringify({ url: authUrl.toString() }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in basecamp-auth:", error);
    const errorMessage = "Authentication initialization failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } }
    );
  }
});
