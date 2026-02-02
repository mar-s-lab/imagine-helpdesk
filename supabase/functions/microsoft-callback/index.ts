import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const clientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET");
    const tenantId = Deno.env.get("MICROSOFT_TENANT_ID");
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
    const errorDescription = url.searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error, errorDescription);
      return Response.redirect(`${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth?error=${encodeURIComponent(errorDescription || error)}`, 302);
    }

    if (!code || !stateParam) {
      console.error("Missing code or state");
      return Response.redirect(`${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth?error=missing_params`, 302);
    }

    // Decode state to get returnUrl
    let returnUrl = "/";
    try {
      const stateData = JSON.parse(atob(stateParam));
      returnUrl = stateData.returnUrl || "/";
    } catch (e) {
      console.error("Error decoding state:", e);
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
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return Response.redirect(`${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth?error=token_exchange_failed`, 302);
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
      const errorText = await userResponse.text();
      console.error("Failed to get user info:", errorText);
      return Response.redirect(`${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth?error=user_info_failed`, 302);
    }

    const microsoftUser = await userResponse.json();
    console.log("Microsoft user info:", { id: microsoftUser.id, email: microsoftUser.mail || microsoftUser.userPrincipalName });

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
      console.error("Error listing users:", listError);
      return Response.redirect(`${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth?error=database_error`, 302);
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
      console.log("Updated existing user:", userId);
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
        console.error("Error creating user:", createError);
        return Response.redirect(`${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth?error=user_creation_failed`, 302);
      }

      userId = newUser.user.id;
      console.log("Created new user:", userId);
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
      console.error("Error generating session link:", sessionError);
      return Response.redirect(`${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth?error=session_error`, 302);
    }

    // Extract the token from the magic link and redirect
    const magicLinkUrl = new URL(sessionData.properties.action_link);
    const token = magicLinkUrl.searchParams.get("token");
    const type = magicLinkUrl.searchParams.get("type");

    // Redirect to the app with the magic link token
    const appBaseUrl = supabaseUrl.replace("wyiwurjskmtdcwfakels.supabase.co", "imagine-helpdesk.lovable.app");
    const redirectUrl = `${appBaseUrl}/auth/callback?token=${token}&type=${type}&redirect_to=${encodeURIComponent(returnUrl)}`;

    console.log("Redirecting to app:", redirectUrl);
    return Response.redirect(redirectUrl, 302);

  } catch (error) {
    console.error("Error in microsoft-callback:", error);
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    return Response.redirect(`${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth?error=internal_error`, 302);
  }
});
