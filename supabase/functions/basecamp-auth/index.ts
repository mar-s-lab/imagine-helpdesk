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
  }
});
