import type { Config } from "@netlify/functions";
import { authorised, json, readJson, requiredEnv } from "./_lib/env.mts";

async function supabase(path: string, init: RequestInit = {}) {
  const url = requiredEnv("SUPABASE_URL");
  const key = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
      ...(init.headers ?? {})
    }
  });
}

export default async (request: Request) => {
  if (request.method !== "POST") return json({error:"method_not_allowed"},405);
  if (!authorised(request)) return json({error:"unauthorized"},401);
  const body = await readJson(request);
  if (!body || typeof body !== "object") return json({error:"invalid_json"},400);

  const publication = body.publication;
  const metrics = Array.isArray(body.metrics) ? body.metrics : [];
  const posts = Array.isArray(body.posts) ? body.posts : [];
  if (!publication?.name) return json({error:"publication.name_required"},400);
  if (!metrics.length) return json({error:"metrics_required"},400);

  try {
    const pubRes = await supabase("substack_publications?select=id&name=eq." + encodeURIComponent(publication.name) + "&limit=1");
    if (!pubRes.ok) throw new Error(`publication lookup failed: ${pubRes.status}`);
    const existing = await pubRes.json();
    let publicationId = existing[0]?.id;

    if (!publicationId) {
      const create = await supabase("substack_publications", {
        method:"POST",
        body:JSON.stringify({name:publication.name,publication_url:publication.url ?? null})
      });
      if (!create.ok) throw new Error(`publication create failed: ${create.status}`);
      publicationId = (await create.json())[0]?.id;
    }

    if (!publicationId) throw new Error("publication id unavailable");

    const metricRows = metrics.map((m:any) => ({
      publication_id: publicationId,
      metric_date: m.metric_date ?? m.date,
      subscribers: Number(m.subscribers ?? 0),
      paid_subscribers: Number(m.paid_subscribers ?? m.paidSubscribers ?? 0),
      free_subscribers: Number(m.free_subscribers ?? m.freeSubscribers ?? 0),
      revenue: Number(m.revenue ?? 0),
      views: Number(m.views ?? 0),
      new_subscribers: Number(m.new_subscribers ?? m.newSubscribers ?? 0),
      unsubscribes: Number(m.unsubscribes ?? 0)
    })).filter((m:any) => m.metric_date);

    const metricsRes = await supabase("substack_daily_metrics?on_conflict=publication_id%2Cmetric_date", {
      method:"POST",
      body:JSON.stringify(metricRows)
    });
    if (!metricsRes.ok) throw new Error(`metrics upsert failed: ${metricsRes.status}`);

    if (posts.length) {
      const postRows = posts.filter((p:any)=>p.title).map((p:any)=>({
        publication_id:publicationId,
        external_id:p.external_id ?? p.id ?? null,
        title:String(p.title),
        published_at:p.published_at ?? p.publishedAt ?? null,
        views:Number(p.views ?? 0),
        likes:Number(p.likes ?? 0),
        comments:Number(p.comments ?? 0),
        free_signups:Number(p.free_signups ?? p.freeSignups ?? 0),
        paid_signups:Number(p.paid_signups ?? p.paidSignups ?? 0),
        revenue:Number(p.revenue ?? 0),
        traffic_source:p.traffic_source ?? p.trafficSource ?? null,
        category:p.category ?? null
      }));
      if (postRows.length) {
        const postsRes = await supabase("substack_posts?on_conflict=publication_id,external_id", {
          method:"POST",
          body:JSON.stringify(postRows)
        });
        if (!postsRes.ok) throw new Error(`posts upsert failed: ${postsRes.status}`);
      }
    }

    return json({ok:true, publicationId, metrics:metricRows.length, posts:posts.length});
  } catch (error) {
    return json({error:"ingest_failed",message:error instanceof Error ? error.message : "unknown_error"},500);
  }
};

export const config: Config = { path: "/api/ingest" };
