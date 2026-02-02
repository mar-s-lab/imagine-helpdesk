import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getCorsHeaders,
  createCorsPreflightResponse,
  createJsonResponse,
  logInfo,
  logError,
  logWarn,
} from "../_shared/cors.ts";

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

  logInfo("basecamp_token_refresh_start", {});
  
  const clientId = Deno.env.get("BASECAMP_CLIENT_ID")?.trim();
  const clientSecret = Deno.env.get("BASECAMP_CLIENT_SECRET")?.trim();
  
  if (!clientId || !clientSecret) {
    logError("basecamp_token_refresh_config_error", new Error("Missing credentials"));
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
    logError("basecamp_token_refresh_failed", new Error("Refresh failed"), {
      status: refreshResponse.status,
    });
    return null;
  }

  const newTokenData = await refreshResponse.json();
  
  // Update stored token
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

  logInfo("basecamp_token_refresh_success", {});
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

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return createCorsPreflightResponse(origin);
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return createJsonResponse({ error: "Method not allowed" }, 405, origin);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const accountId = Deno.env.get("BASECAMP_ACCOUNT_ID")?.trim();
    const projectId = Deno.env.get("BASECAMP_PROJECT_ID")?.trim();
    const columnId = Deno.env.get("BASECAMP_COLUMN_ID")?.trim();

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      logError("basecamp_sync_config_error", new Error("Missing Supabase config"));
      return createJsonResponse({ error: "Server configuration error" }, 500, origin);
    }

    // Verify JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logError("basecamp_sync_auth_error", new Error("Missing authorization"));
      return createJsonResponse({ error: "Unauthorized" }, 401, origin);
    }

    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      logError("basecamp_sync_jwt_error", authError || new Error("Invalid token"));
      return createJsonResponse({ error: "Invalid authentication" }, 401, origin);
    }

    logInfo("basecamp_sync_auth_success", { userId: user.id });

    if (!accountId || !projectId || !columnId) {
      logError("basecamp_sync_project_config_error", new Error("Missing project config"));
      return createJsonResponse(
        { error: "Basecamp project not configured. Please set BASECAMP_ACCOUNT_ID, BASECAMP_PROJECT_ID, and BASECAMP_COLUMN_ID." },
        500,
        origin
      );
    }

    // Parse request body
    const body: TicketData = await req.json();
    
    if (!body.nomenclature || !body.description) {
      return createJsonResponse({ error: "Missing required ticket data" }, 400, origin);
    }

    // Get access token from database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: tokenData, error: tokenError } = await supabase
      .from('basecamp_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('id', 'system')
      .single();

    if (tokenError || !tokenData) {
      logError("basecamp_sync_no_token", tokenError || new Error("No token found"));
      return createJsonResponse(
        { error: "Basecamp not connected. Please connect in Settings." },
        401,
        origin
      );
    }

    // Refresh token if needed
    const accessToken = await refreshTokenIfNeeded(tokenData, supabaseUrl, supabaseServiceKey);
    
    if (!accessToken) {
      return createJsonResponse(
        { error: "Basecamp session expired. Please reconnect in Settings." },
        401,
        origin
      );
    }

    // Build card content
    const cardContent = buildCardContent(body);

    // Create Card in Basecamp
    const basecampApiUrl = `https://3.basecampapi.com/${accountId}/buckets/${projectId}/card_tables/lists/${columnId}/cards.json`;
    
    logInfo("basecamp_card_create_start", {
      ticketId: body.nomenclature,
      module: body.module,
      type: body.type,
    });

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
      
      // Handle rate limiting
      if (cardResponse.status === 429) {
        logWarn("basecamp_rate_limit", { ticketId: body.nomenclature });
        return createJsonResponse(
          { error: "Basecamp rate limit exceeded. Please try again later." },
          429,
          origin
        );
      }
      
      logError("basecamp_card_create_failed", new Error(errorText), {
        status: cardResponse.status,
        ticketId: body.nomenclature,
      });
      
      return createJsonResponse(
        { error: "Failed to create card in Basecamp" },
        500,
        origin
      );
    }

    const cardData = await cardResponse.json();
    
    logInfo("basecamp_card_create_success", {
      ticketId: body.nomenclature,
      cardId: cardData.id,
      cardUrl: cardData.app_url,
      userId: user.id,
    });

    return createJsonResponse(
      { 
        success: true, 
        cardId: cardData.id,
        cardUrl: cardData.app_url,
      },
      200,
      origin
    );

  } catch (error: unknown) {
    logError("basecamp_sync_exception", error);
    return createJsonResponse(
      { error: error instanceof Error ? error.message : "Sync failed" },
      500,
      origin
    );
  }
});
