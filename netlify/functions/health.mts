import type { Config } from "@netlify/functions";

export default async () => {
  return new Response(JSON.stringify({
    ok: true,
    service: "substack-os",
    mode: "mcp-ready",
    timestamp: new Date().toISOString()
  }), { headers: { "content-type": "application/json" } });
};

export const config: Config = { path: "/api/health" };