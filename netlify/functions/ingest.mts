import type { Config } from "@netlify/functions";
import { authorised, json, readJson } from "./_lib/env.mts";
import { upsertSnapshot } from "../../storage/store.mjs";

export default async (request: Request) => {
  if (request.method !== "POST") return json({error:"method_not_allowed"},405);
  if (!authorised(request)) return json({error:"unauthorized"},401);
  const body = await readJson(request);
  if (!body || typeof body !== "object") return json({error:"invalid_json"},400);
  if (!body.publication?.name) return json({error:"publication.name_required"},400);
  if (!Array.isArray(body.metrics)) return json({error:"metrics_required"},400);
  try {
    const saved=upsertSnapshot(body);
    return json({ok:true,publication:saved.publication.name,metrics:saved.metrics.length,posts:saved.posts.length});
  } catch(error) {
    return json({error:"ingest_failed",message:error instanceof Error?error.message:"unknown_error"},500);
  }
};
export const config: Config = { path:"/api/ingest" };