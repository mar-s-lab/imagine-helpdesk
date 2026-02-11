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

// Refresh token if expired
async function refreshTokenIfNeeded(
  tokenData: { access_token: string; refresh_token: string; expires_at: string },
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<string | null> {
  if (new Date(tokenData.expires_at) >= new Date()) {
    return tokenData.access_token;
  }

  console.log("Token expired, refreshing...");
  
  const clientId = Deno.env.get("BASECAMP_CLIENT_ID")?.trim();
  const clientSecret = Deno.env.get("BASECAMP_CLIENT_SECRET")?.trim();
  
  if (!clientId || !clientSecret) {
    console.error("Missing Basecamp OAuth credentials");
    return null;
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
    return null;
  }

  const newTokenData = await refreshResponse.json();
  
  // Update stored token using a new client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  await supabase
    .from('basecamp_tokens')
    .update({
      access_token: newTokenData.access_token,
      refresh_token: newTokenData.refresh_token || tokenData.refresh_token,
      expires_at: new Date(Date.now() + (newTokenData.expires_in || 1209600) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'system');

  return newTokenData.access_token;
}

// Build card content from ticket data
function buildCardContent(body: TicketData): string {
  return `
<strong>Necesidad:</strong>
${body.formData.need}

<strong>Flujo deseado:</strong>
${body.formData.desiredFlow}

<strong>Contexto:</strong>
${body.formData.context}

---
<em>Módulo: ${body.module} | Tipo: ${body.type}</em>
  `.trim();
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const accountId = Deno.env.get("BASECAMP_ACCOUNT_ID")?.trim();
    const projectId = Deno.env.get("BASECAMP_PROJECT_ID")?.trim();
    const columnId = Deno.env.get("BASECAMP_COLUMN_ID")?.trim();

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify JWT token in code (required for Lovable Cloud ES256 tokens)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      console.error("JWT verification failed:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    if (!accountId || !projectId || !columnId) {
      console.error("Missing Basecamp project configuration");
      return new Response(
        JSON.stringify({ error: "Basecamp project not configured. Please set BASECAMP_ACCOUNT_ID, BASECAMP_PROJECT_ID, and BASECAMP_COLUMN_ID." }),
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

    // Get access token from database using service role
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

    // Refresh token if needed
    const accessToken = await refreshTokenIfNeeded(tokenData, supabaseUrl, supabaseServiceKey);
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Basecamp session expired. Please reconnect in Settings." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build card content with ticket details
    const cardContent = buildCardContent(body);

    // Create Card in Basecamp Card Table
    // API: POST /buckets/{project_id}/card_tables/lists/{column_id}/cards.json
    const basecampApiUrl = `https://3.basecampapi.com/${accountId}/buckets/${projectId}/card_tables/lists/${columnId}/cards.json`;
    
    console.log("Creating card in Basecamp:", basecampApiUrl);

    const cardResponse = await fetch(basecampApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "User-Agent": "Helpdesk App (support@company.com)",
      },
      body: JSON.stringify({
        title: body.nomenclature,
        content: cardContent,
        notify: true,
      }),
    });

    if (!cardResponse.ok) {
      const errorText = await cardResponse.text();
      console.error("Basecamp API error:", cardResponse.status, errorText);
      
      // Handle rate limiting
      if (cardResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Basecamp rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to create card in Basecamp" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cardData = await cardResponse.json();
    console.log("Successfully created Basecamp card:", cardData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        cardId: cardData.id,
        cardUrl: cardData.app_url,
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
