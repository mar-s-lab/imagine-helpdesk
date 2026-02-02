import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    // Only allow DELETE
    if (req.method !== "DELETE") {
      return createJsonResponse({ error: "Method not allowed" }, 405, origin);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      logError("basecamp_disconnect_config_error", new Error("Missing Supabase config"));
      return createJsonResponse({ error: "Server configuration error" }, 500, origin);
    }

    // Verify JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logError("basecamp_disconnect_auth_error", new Error("Missing authorization"));
      return createJsonResponse({ error: "Unauthorized" }, 401, origin);
    }

    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      logError("basecamp_disconnect_jwt_error", authError || new Error("Invalid token"));
      return createJsonResponse({ error: "Invalid authentication" }, 401, origin);
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await authClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      logError("basecamp_disconnect_permission_error", new Error("Not admin"));
      return createJsonResponse({ error: "Only admins can disconnect Basecamp" }, 403, origin);
    }

    logInfo("basecamp_disconnect_start", { userId: user.id });

    // Delete the token using service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: deleteError } = await supabase
      .from('basecamp_tokens')
      .delete()
      .eq('id', 'system');

    if (deleteError) {
      logError("basecamp_disconnect_delete_error", deleteError);
      return createJsonResponse({ error: "Failed to disconnect Basecamp" }, 500, origin);
    }

    logInfo("basecamp_disconnect_success", { userId: user.id });

    return createJsonResponse(
      { success: true, message: "Basecamp disconnected successfully" },
      200,
      origin
    );

  } catch (error: unknown) {
    logError("basecamp_disconnect_exception", error);
    return createJsonResponse(
      { error: error instanceof Error ? error.message : "Disconnect failed" },
      500,
      origin
    );
  }
});
