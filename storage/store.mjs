const memory = globalThis.__SUBSTACK_OS_STORE ??= { publications:new Map(), metrics:new Map(), posts:new Map() };

const key = (name) => String(name).trim().toLowerCase();

export function upsertSnapshot(snapshot) {
  const name = snapshot.publication?.name;
  if (!name) throw new Error("publication.name_required");
  const k = key(name);
  const existing = memory.publications.get(k) ?? { name, url: snapshot.publication.url ?? null };
  memory.publications.set(k, {...existing,...snapshot.publication});
  memory.metrics.set(k, Array.isArray(snapshot.metrics) ? snapshot.metrics : []);
  memory.posts.set(k, Array.isArray(snapshot.posts) ? snapshot.posts : []);
  return {publication:memory.publications.get(k), metrics:memory.metrics.get(k), posts:memory.posts.get(k)};
}

export function getSnapshot(name) {
  const k=key(name);
  if (!memory.publications.has(k)) return null;
  return {publication:memory.publications.get(k),metrics:memory.metrics.get(k) ?? [],posts:memory.posts.get(k) ?? []};
}