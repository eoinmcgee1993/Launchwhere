import type { Config } from "@netlify/functions";
import { json, requiredEnv } from "./_lib/env.mts";
import { analysePublication } from "../../analytics/index.mjs";

async function supabase(path: string) {
  const url = requiredEnv("SUPABASE_URL");
  const key = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return fetch(`${url}/rest/v1/${path}`, {
    headers:{apikey:key,Authorization:`Bearer ${key}`}
  });
}

export default async (request: Request) => {
  if (request.method !== "GET") return json({error:"method_not_allowed"},405);
  const name = new URL(request.url).searchParams.get("publication");
  if (!name) return json({error:"publication_required"},400);
  try {
    const pub = await supabase("substack_publications?select=id,name,publication_url&name=eq."+encodeURIComponent(name)+"&limit=1");
    if (!pub.ok) throw new Error(`publication lookup failed: ${pub.status}`);
    const publications = await pub.json();
    if (!publications[0]) return json({error:"not_found"},404);
    const id = publications[0].id;
    const [m,p] = await Promise.all([
      supabase("substack_daily_metrics?select=*&publication_id=eq."+id+"&order=metric_date.asc"),
      supabase("substack_posts?select=*&publication_id=eq."+id+"&order=published_at.desc")
    ]);
    if (!m.ok || !p.ok) throw new Error("data read failed");
    const [metrics,posts] = await Promise.all([m.json(),p.json()]);
    return json({publication:publications[0],...analysePublication({metrics,posts})});
  } catch(error) {
    return json({error:"read_failed",message:error instanceof Error ? error.message : "unknown_error"},500);
  }
};

export const config: Config = { path: "/api/publication" };
