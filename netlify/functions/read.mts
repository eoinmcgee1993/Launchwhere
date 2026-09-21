import type { Config } from "@netlify/functions";
import { json } from "./_lib/env.mts";
import { getSnapshot } from "../../storage/store.mjs";
import { analysePublication } from "../../analytics/index.mjs";

export default async (request: Request) => {
  if (request.method !== "GET") return json({error:"method_not_allowed"},405);
  const name=new URL(request.url).searchParams.get("publication");
  if (!name) return json({error:"publication_required"},400);
  const snapshot=getSnapshot(name);
  if (!snapshot) return json({error:"not_found"},404);
  return json({publication:snapshot.publication,...analysePublication(snapshot)});
};
export const config: Config = { path:"/api/publication" };