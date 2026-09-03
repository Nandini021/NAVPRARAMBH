# SIDDHI AI chat

This authenticated Edge Function is the server-side bridge between NAVPRARAMBH's SIDDHI product layer and Google Gemini.

## Required secret

Configure this in Supabase Edge Function secrets, never in frontend `.env` files:

```text
GEMINI_API_KEY
```

Optional server-side model override:

```text
GEMINI_MODEL=gemini-3.7-flash
```

The current default is `gemini-3.7-flash`, a stable model listed in Google's Gemini API model documentation. The function calls the official Interactions API and sends the key only in the server-side request.

## Request

The browser invokes `siddhi-chat` with:

```json
{
  "message": "What should I learn for data analysis?",
  "conversation": []
}
```

The function requires a signed-in Supabase user, reads that user's existing rows, and never trusts browser-supplied student context.

## Response

```json
{
  "text": "...",
  "provider": "gemini",
  "actions": [{ "id": "courses", "label": "Open Courses" }]
}
```

Actions are restricted to the frontend registry. No migration or durable AI conversation table is required by this version. If Gemini is unavailable or the secret is missing, SIDDHI returns a local fallback response.
