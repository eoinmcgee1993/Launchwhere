# Substack OS

A provider-neutral publication intelligence spine.

## Architecture
Substack MCP -> assistant ingest -> Netlify -> in-memory snapshot store -> analytics -> dashboard.

No Supabase, database credentials, or browser database access are required.

The assistant/client reads publication data through the official Substack MCP and POSTs a normalized snapshot to `/api/ingest`. Netlify serves the current snapshot through `/api/publication`.

## Environment
Set `SUBSTACK_INGEST_SECRET` in Netlify. No database key is required.

## Local verification
`node --test test/**/*.test.mjs`

## Deferred
Durable persistence can be added later behind the storage module without changing the analytics or dashboard contract. Telegram, n8n orchestration and additional AI front ends remain downstream of this spine.
