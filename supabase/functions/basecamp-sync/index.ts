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

interface TicketData {
  nomenclature: string;
  description: string;
  module: string;
  type: string;
  formData: {
    need: string;
    desiredFlow: string;
    context: string;
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
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const accountId = Deno.env.get("BASECAMP_ACCOUNT_ID")?.trim();
    const projectId = Deno.env.get("BASECAMP_PROJECT_ID")?.trim();
    const todolistId = Deno.env.get("BASECAMP_TODOLIST_ID")?.trim();

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!accountId || !projectId || !todolistId) {
      console.error("Missing Basecamp project configuration");
      return new Response(
        JSON.stringify({ error: "Basecamp project not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: TicketData = await req.json();
    
    if (!body.nomenclature || !body.description) {
      return new Response(
        JSON.stringify({ error: "Missing required ticket data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get access token from database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: tokenData, error: tokenError } = await supabase
      .from('basecamp_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('id', 'system')
      .single();

    if (tokenError || !tokenData) {
      console.error("No Basecamp token found:", tokenError);
      return new Response(
        JSON.stringify({ error: "Basecamp not connected. Please connect in Settings." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = tokenData.access_token;

    // Check if token is expired and refresh if needed
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log("Token expired, refreshing...");
      
      const clientId = Deno.env.get("BASECAMP_CLIENT_ID")?.trim();
      const clientSecret = Deno.env.get("BASECAMP_CLIENT_SECRET")?.trim();
      
      if (!clientId || !clientSecret) {
        return new Response(
          JSON.stringify({ error: "Basecamp OAuth not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const refreshResponse = await fetch("https://launchpad.37signals.com/authorization/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          type: "refresh",
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokenData.refresh_token,
        }),
      });

      if (!refreshResponse.ok) {
        console.error("Token refresh failed:", refreshResponse.status);
        return new Response(
          JSON.stringify({ error: "Basecamp session expired. Please reconnect in Settings." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const newTokenData = await refreshResponse.json();
      accessToken = newTokenData.access_token;

      // Update stored token
      await supabase
        .from('basecamp_tokens')
        .update({
          access_token: newTokenData.access_token,
          refresh_token: newTokenData.refresh_token || tokenData.refresh_token,
          expires_at: new Date(Date.now() + (newTokenData.expires_in || 1209600) * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'system');
    }

    // Build todo content with ticket details
    const todoContent = `
<strong>${body.nomenclature}</strong>

<strong>Necesidad:</strong>
${body.formData.need}

<strong>Flujo deseado:</strong>
${body.formData.desiredFlow}

<strong>Contexto:</strong>
${body.formData.context}

---
<em>Módulo: ${body.module} | Tipo: ${body.type}</em>
    `.trim();

    // Create todo in Basecamp
    // API: POST /buckets/{project_id}/todolists/{todolist_id}/todos.json
    const basecampApiUrl = `https://3.basecampapi.com/${accountId}/buckets/${projectId}/todolists/${todolistId}/todos.json`;
    
    console.log("Creating todo in Basecamp:", basecampApiUrl);

    const todoResponse = await fetch(basecampApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "User-Agent": "Helpdesk App (support@company.com)",
      },
      body: JSON.stringify({
        content: body.nomenclature,
        description: todoContent,
        notify: true,
      }),
    });

    if (!todoResponse.ok) {
      const errorText = await todoResponse.text();
      console.error("Basecamp API error:", todoResponse.status, errorText);
      
      // Handle rate limiting
      if (todoResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Basecamp rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to create todo in Basecamp" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const todoData = await todoResponse.json();
    console.log("Successfully created Basecamp todo:", todoData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        todoId: todoData.id,
        todoUrl: todoData.app_url,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in basecamp-sync:", error);
    const errorMessage = error instanceof Error ? error.message : "Sync failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" } }
    );
  }
});
