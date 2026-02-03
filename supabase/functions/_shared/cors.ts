<<<<<<< HEAD
// Shared CORS headers for Supabase Edge Functions

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export function handleCorsPreFlight(): Response {
  return new Response('ok', { headers: corsHeaders });
}

export function createJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
=======
// Shared CORS utilities for Basecamp edge functions
// This file provides consistent CORS handling across all functions

// Allowed origins for CORS - restrict to application domains
export const allowedOriginPatterns = [
  /^https:\/\/imagine-helpdesk\.lovable\.app$/,
  /^https:\/\/id-preview--[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
];

// Default fallback origin
const DEFAULT_ORIGIN = 'https://imagine-helpdesk.lovable.app';

/**
 * Check if an origin is allowed based on the patterns
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return allowedOriginPatterns.some(pattern => pattern.test(origin));
}

/**
 * Get CORS headers for a given origin
 * Returns restrictive headers with the allowed origin
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isOriginAllowed(origin) ? origin! : DEFAULT_ORIGIN;
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

/**
 * Determine the frontend URL based on request origin
 * Used for redirects after OAuth flows
 */
export function getFrontendUrl(origin: string | null): string {
  if (origin && isOriginAllowed(origin)) {
    return origin;
  }
  return DEFAULT_ORIGIN;
}

/**
 * Create a CORS preflight response
 */
export function createCorsPreflightResponse(origin: string | null): Response {
  return new Response("ok", { headers: getCorsHeaders(origin) });
}

/**
 * Create a JSON response with CORS headers
 */
export function createJsonResponse(
  data: Record<string, unknown>,
  status: number,
  origin: string | null
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
>>>>>>> 3e3c5f7eb258b22c1711877e5d520a0eca8b636a
    },
  });
}

<<<<<<< HEAD
export function createErrorResponse(message: string, status = 400): Response {
  return createJsonResponse({ error: message }, status);
=======
/**
 * Create a redirect response with CORS headers
 */
export function createRedirectResponse(
  location: string,
  origin: string | null
): Response {
  return new Response(null, {
    status: 302,
    headers: {
      ...getCorsHeaders(origin),
      "Location": location,
    },
  });
}

// ===========================================
// Structured Logging Utilities
// ===========================================

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  action: string;
  [key: string]: unknown;
}

/**
 * Create a structured log entry
 */
export function log(level: LogLevel, context: LogContext): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    ...context,
  };
  
  const message = JSON.stringify(entry);
  
  switch (level) {
    case 'error':
      console.error(message);
      break;
    case 'warn':
      console.warn(message);
      break;
    case 'debug':
      console.debug(message);
      break;
    default:
      console.log(message);
  }
}

/**
 * Log an info message with context
 */
export function logInfo(action: string, context: Record<string, unknown> = {}): void {
  log('info', { action, ...context });
}

/**
 * Log an error message with context
 */
export function logError(action: string, error: unknown, context: Record<string, unknown> = {}): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  log('error', {
    action,
    error: errorMessage,
    stack: errorStack,
    ...context,
  });
}

/**
 * Log a warning message with context
 */
export function logWarn(action: string, context: Record<string, unknown> = {}): void {
  log('warn', { action, ...context });
>>>>>>> 3e3c5f7eb258b22c1711877e5d520a0eca8b636a
}
