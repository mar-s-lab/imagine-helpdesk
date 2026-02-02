import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get("MICROSOFT_CLIENT_ID");
    const tenantId = Deno.env.get("MICROSOFT_TENANT_ID");

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
    
    // Generate a random state for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state and returnUrl in a cookie-like format encoded in state
    const stateData = btoa(JSON.stringify({ state, returnUrl }));

    // Build the Microsoft OAuth authorization URL
    const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", `${Deno.env.get("SUPABASE_URL")}/functions/v1/microsoft-callback`);
    authUrl.searchParams.set("scope", "openid profile email User.Read");
    authUrl.searchParams.set("response_mode", "query");
    authUrl.searchParams.set("state", stateData);

    console.log("Redirecting to Microsoft OAuth:", authUrl.toString());

    return new Response(JSON.stringify({ url: authUrl.toString() }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in microsoft-auth:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
