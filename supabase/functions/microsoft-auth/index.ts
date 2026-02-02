import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to application domains
const allowedOrigins = [
  'https://imagine-helpdesk.lovable.app',
  'https://id-preview--1e7cb785-cbf5-4770-9bb4-7bb5950ff6b9.lovable.app',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && allowedOrigins.some(o => origin.startsWith(o.replace(/\.lovable\.app$/, ''))) 
    ? origin 
    : allowedOrigins[0];
  
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
    const clientId = Deno.env.get("MICROSOFT_CLIENT_ID")?.trim();
    const tenantId = Deno.env.get("MICROSOFT_TENANT_ID")?.trim();

    if (!clientId || !tenantId) {
      console.error("Missing Microsoft OAuth configuration");
      return new Response(
        JSON.stringify({ error: "Microsoft OAuth not configured" }),
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

    // Build the Microsoft OAuth authorization URL
    const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", `${Deno.env.get("SUPABASE_URL")}/functions/v1/microsoft-callback`);
    authUrl.searchParams.set("scope", "openid profile email User.Read");
    authUrl.searchParams.set("response_mode", "query");
    authUrl.searchParams.set("state", stateData);

    console.log("Redirecting to Microsoft OAuth");

    return new Response(JSON.stringify({ url: authUrl.toString() }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in microsoft-auth:", error);
    const errorMessage = "Authentication initialization failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } }
    );
  }
});
