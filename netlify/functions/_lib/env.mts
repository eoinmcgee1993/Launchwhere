export function env(name: string): string | undefined {
  return Netlify.env.get(name) ?? undefined;
}

export function requiredEnv(name: string): string {
  const value = env(name);
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export async function readJson(request: Request): Promise<any> {
  try { return await request.json(); } catch { return null; }
}

export function authorised(request: Request): boolean {
  const expected = env("SUBSTACK_INGEST_SECRET");
  if (!expected) return false;
  return request.headers.get("authorization") === `Bearer ${expected}`;
}