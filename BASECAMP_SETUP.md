# Basecamp Integration Setup Guide

This guide explains how to set up the Basecamp OAuth integration for the Executive Summaries feature.

## Overview

The integration uses OAuth 2.0 to securely connect users' Basecamp accounts. An admin needs to register the app once, and then all users can connect their accounts.

## Admin Setup (One-time)

### Step 1: Register OAuth App at 37signals

1. Go to [37signals Launchpad](https://launchpad.37signals.com/integrations)
2. Sign in with your Basecamp account
3. Click **"Register another application"**
4. Fill in the form:
   - **Name**: `Imagine HelpDesk` (or your preferred name)
   - **Organization**: Your company name
   - **Website URL**: Your app's URL (e.g., `https://your-app.com`)
   - **Redirect URI**: `https://your-project.supabase.co/functions/v1/basecamp-callback`

5. Click **"Register this app"**
6. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Supabase Secrets

Set the following secrets in your Supabase project:

```bash
# Using Supabase CLI
supabase secrets set BASECAMP_CLIENT_ID="your-client-id-here"
supabase secrets set BASECAMP_CLIENT_SECRET="your-client-secret-here"
supabase secrets set BASECAMP_REDIRECT_URI="https://your-project.supabase.co/functions/v1/basecamp-callback"
supabase secrets set APP_URL="https://your-app-domain.com"
```

Or set them in the Supabase Dashboard:
1. Go to **Project Settings** → **Edge Functions**
2. Add each secret with its value

### Step 3: Deploy Edge Functions

Deploy the Basecamp Edge Functions:

```bash
supabase functions deploy basecamp-auth
supabase functions deploy basecamp-callback
supabase functions deploy basecamp-projects
supabase functions deploy basecamp-executive-summary
```

### Step 4: Run Database Migration

Apply the migration to create the `basecamp_tokens` table:

```bash
supabase db push
```

## User Flow

Once the admin setup is complete, users can connect their Basecamp accounts:

1. User navigates to **Settings** page
2. Clicks **"Conectar con Basecamp"**
3. Gets redirected to Basecamp authorization page
4. Authorizes the app
5. Gets redirected back to the app
6. Connection is saved automatically
7. User can now access **Executive Summaries**

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Frontend      │     │  Supabase Edge Fns   │     │   Basecamp API  │
│   (React)       │     │                      │     │                 │
└────────┬────────┘     └──────────┬───────────┘     └────────┬────────┘
         │                         │                          │
         │  1. Request auth URL    │                          │
         │────────────────────────>│                          │
         │                         │                          │
         │  2. Return auth URL     │                          │
         │<────────────────────────│                          │
         │                         │                          │
         │  3. Redirect to Basecamp│                          │
         │─────────────────────────────────────────────────────>
         │                         │                          │
         │  4. User authorizes     │                          │
         │<─────────────────────────────────────────────────────
         │                         │                          │
         │  5. Callback with code  │                          │
         │────────────────────────>│                          │
         │                         │  6. Exchange code        │
         │                         │─────────────────────────>│
         │                         │                          │
         │                         │  7. Return tokens        │
         │                         │<─────────────────────────│
         │                         │                          │
         │                         │  8. Store tokens         │
         │                         │  (Supabase DB)           │
         │                         │                          │
         │  9. Redirect success    │                          │
         │<────────────────────────│                          │
```

## Troubleshooting

### "Basecamp OAuth not configured"
- Ensure all secrets are set in Supabase
- Check that the Edge Functions are deployed

### "No Basecamp account found"
- User needs an active Basecamp 3 or 4 account
- Check that the user is logged into the correct Basecamp account

### "Token exchange failed"
- Verify the Client Secret is correct
- Check the Redirect URI matches exactly

### "State expired"
- User took too long to authorize (>5 minutes)
- They should try connecting again

## Security Notes

- Tokens are stored securely in Supabase with Row Level Security
- Each user can only access their own tokens
- The Client Secret is never exposed to the frontend
- State parameter prevents CSRF attacks
- Tokens can be refreshed automatically (if implemented)

## Environment Variables Reference

| Variable | Location | Description |
|----------|----------|-------------|
| `BASECAMP_CLIENT_ID` | Supabase Secrets | OAuth Client ID from 37signals |
| `BASECAMP_CLIENT_SECRET` | Supabase Secrets | OAuth Client Secret from 37signals |
| `BASECAMP_REDIRECT_URI` | Supabase Secrets | Callback URL for OAuth |
| `APP_URL` | Supabase Secrets | Your frontend app URL |

## Links

- [Basecamp API Documentation](https://github.com/basecamp/bc3-api)
- [37signals Launchpad](https://launchpad.37signals.com/integrations)
- [OAuth 2.0 Authentication Guide](https://github.com/basecamp/api/blob/master/sections/authentication.md)
