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

// Map OAuth error codes to safe, predefined error messages
const ERROR_MESSAGES: Record<string, string> = {
  "access_denied": "access_denied",
  "consent_required": "consent_required",
  "interaction_required": "interaction_required",
  "invalid_request": "invalid_request",
  "server_error": "server_error",
  "temporarily_unavailable": "temporarily_unavailable",
};

function getSafeErrorCode(error: string | null): string {
  if (!error) return "unknown_error";
  return ERROR_MESSAGES[error] || "oauth_failed";
}

// Validate state parameter format and structure
function validateState(stateParam: string): { isValid: boolean; returnUrl: string } {
  try {
    // Check reasonable length (base64 encoded JSON shouldn't be too long)
    if (stateParam.length > 500) {
      return { isValid: false, returnUrl: "/" };
    }

    // Attempt to decode and parse
    const decoded = atob(stateParam);
    const stateData = JSON.parse(decoded);

    // Verify expected structure
    if (typeof stateData !== 'object' || stateData === null) {
      return { isValid: false, returnUrl: "/" };
    }

    // Verify state contains a UUID-like value
    if (typeof stateData.state !== 'string' || !/^[0-9a-f-]{36}$/i.test(stateData.state)) {
      return { isValid: false, returnUrl: "/" };
    }

    // Validate and sanitize returnUrl - only allow relative paths
    let returnUrl = "/";
    if (typeof stateData.returnUrl === 'string') {
      // Only allow paths that start with / and don't start with // (protocol-relative URLs)
      if (stateData.returnUrl.startsWith("/") && !stateData.returnUrl.startsWith("//")) {
        // Further sanitize: remove any potentially dangerous characters
        returnUrl = stateData.returnUrl.replace(/[<>"']/g, '');
      }
    }

    return { isValid: true, returnUrl };
  } catch {
    return { isValid: false, returnUrl: "/" };
  }
}

// Validate OAuth authorization code format
function isValidAuthCode(code: string): boolean {
  // OAuth codes are typically alphanumeric with some special chars, reasonable length
  if (!code || code.length < 10 || code.length > 2000) {
    return false;
  }
  // Allow alphanumeric, dots, underscores, hyphens, and some special chars common in OAuth codes
  return /^[a-zA-Z0-9._-]+$/.test(code);
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
    const clientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET")?.trim();
    const tenantId = Deno.env.get("MICROSOFT_TENANT_ID")?.trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!clientId || !clientSecret || !tenantId || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing configuration");
      return new Response("Configuration error", { status: 500 });
    }

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Get app base URL from environment or derive from Supabase URL
    const appBaseUrl = Deno.env.get("APP_BASE_URL") || supabaseUrl.replace('.supabase.co', '.lovable.app');

    // Handle OAuth errors - use safe error codes only
    if (error) {
      const safeErrorCode = getSafeErrorCode(error);
      console.error("OAuth error:", safeErrorCode);
      return Response.redirect(`${appBaseUrl}/auth?error=${safeErrorCode}`, 302);
    }

    if (!code || !stateParam) {
      console.error("Missing code or state");
      return Response.redirect(`${appBaseUrl}/auth?error=missing_params`, 302);
    }

    // Validate authorization code format
    if (!isValidAuthCode(code)) {
      console.error("Invalid authorization code format");
      return Response.redirect(`${appBaseUrl}/auth?error=invalid_code`, 302);
    }

    // Validate and decode state parameter
    const { isValid, returnUrl } = validateState(stateParam);
    if (!isValid) {
      console.error("Invalid state parameter");
      return Response.redirect(`${appBaseUrl}/auth?error=invalid_state`, 302);
    }

    // Exchange code for tokens
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: `${supabaseUrl}/functions/v1/microsoft-callback`,
        grant_type: "authorization_code",
        scope: "openid profile email User.Read",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange failed");
      return Response.redirect(`${appBaseUrl}/auth?error=token_exchange_failed`, 302);
    }

    const tokens = await tokenResponse.json();
    console.log("Token exchange successful");

    // Get user info from Microsoft Graph
    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error("Failed to get user info");
      return Response.redirect(`${appBaseUrl}/auth?error=user_info_failed`, 302);
    }

    const microsoftUser = await userResponse.json();
    console.log("Microsoft user authenticated:", microsoftUser.id?.substring(0, 8) + "...");

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const email = microsoftUser.mail || microsoftUser.userPrincipalName;
    const fullName = microsoftUser.displayName || "";

    // Check if user exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users");
      return Response.redirect(`${appBaseUrl}/auth?error=database_error`, 302);
    }

    let userId: string;
    const existingUser = existingUsers.users.find(u => u.email === email);

    if (existingUser) {
      // User exists, update their metadata
      userId = existingUser.id;
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: fullName,
          microsoft_id: microsoftUser.id,
          provider: "microsoft",
        },
      });
      console.log("Updated existing user");
    } else {
      // Create new user with a random password (they'll use SSO to login)
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          microsoft_id: microsoftUser.id,
          provider: "microsoft",
        },
      });

      if (createError) {
        console.error("Error creating user");
        return Response.redirect(`${appBaseUrl}/auth?error=user_creation_failed`, 302);
      }

      userId = newUser.user.id;
      console.log("Created new user");
    }

    // Generate a session for the user using a magic link token approach
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        redirectTo: returnUrl,
      },
    });

    if (sessionError) {
      console.error("Error generating session link");
      return Response.redirect(`${appBaseUrl}/auth?error=session_error`, 302);
    }

    // Extract the token from the magic link and redirect
    const magicLinkUrl = new URL(sessionData.properties.action_link);
    const token = magicLinkUrl.searchParams.get("token");
    const type = magicLinkUrl.searchParams.get("type");

    // Redirect to the app with the magic link token
    const redirectUrl = `${appBaseUrl}/auth/callback?token=${token}&type=${type}&redirect_to=${encodeURIComponent(returnUrl)}`;

    console.log("OAuth flow completed successfully");
    return Response.redirect(redirectUrl, 302);

  } catch (error) {
    console.error("Error in microsoft-callback");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const appBaseUrl = Deno.env.get("APP_BASE_URL") || supabaseUrl.replace('.supabase.co', '.lovable.app');
    return Response.redirect(`${appBaseUrl}/auth?error=internal_error`, 302);
  }
});
