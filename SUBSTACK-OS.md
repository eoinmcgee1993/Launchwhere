# Substack OS

## Provider-neutral architecture

The system deliberately has no Supabase dependency.

```
Substack MCP
    |
    v
Assistant / MCP client
    |
 POST /api/ingest
    |
    v
Netlify snapshot store
    |
    +--> analytics engine
    |
 GET /api/publication
    |
    v
Dashboard
```

### MCP constraint

MCP is a client-facing protocol. The assistant/client performs the authenticated Substack read, then sends the normalized snapshot to the backend. This avoids inventing a server-to-server Substack credential flow.

### Storage

V1 uses an in-memory Netlify snapshot store. This is intentionally provider-neutral and keeps the MVP dependency-free. It is suitable for the live UI contract and can later be replaced by any durable store through `storage/store.mjs`.

### Security

The ingest route requires `Authorization: Bearer <SUBSTACK_INGEST_SECRET>`. No privileged credential is shipped to browser JavaScript.

### API

`POST /api/ingest`

Body:

```json
{
  "publication": {"name":"Example","url":"https://example.substack.com"},
  "metrics": [{"date":"2026-09-20","subscribers":1200,"paid_subscribers":100}],
  "posts": [{"external_id":"p1","title":"Example","views":1000}]
}
```

`GET /api/publication?publication=Example`

Returns publication data plus analytics and ranked posts.

### Next

Add a durable storage adapter only when persistence is actually needed. Then add Telegram, n8n and additional AI surfaces around the stable API.
