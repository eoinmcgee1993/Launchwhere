export const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export function safeRate(numerator, denominator) {
  const n = num(numerator);
  const d = num(denominator);
  return d === 0 ? 0 : n / d;
}

export function pctChange(current, previous) {
  const c = num(current);
  const p = num(previous);
  if (p === 0) return c === 0 ? 0 : null;
  return ((c - p) / Math.abs(p)) * 100;
}

export function normaliseDailyMetrics(rows = []) {
  return rows
    .filter(Boolean)
    .map((r) => ({
      date: r.date ?? r.metric_date ?? null,
      subscribers: Math.max(0, num(r.subscribers)),
      paidSubscribers: Math.max(0, num(r.paidSubscribers ?? r.paid_subscribers)),
      freeSubscribers: Math.max(0, num(r.freeSubscribers ?? r.free_subscribers)),
      revenue: Math.max(0, num(r.revenue)),
      views: Math.max(0, num(r.views)),
      newSubscribers: Math.max(0, num(r.newSubscribers ?? r.new_subscribers)),
      unsubscribes: Math.max(0, num(r.unsubscribes))
    }))
    .filter((r) => r.date);
}

export function summarise(metrics = []) {
  const rows = normaliseDailyMetrics(metrics).sort((a,b) => a.date.localeCompare(b.date));
  const latest = rows.at(-1) ?? {subscribers:0,paidSubscribers:0,revenue:0,views:0};
  const previous = rows.at(-2) ?? latest;
  return {
    subscribers: latest.subscribers,
    paidSubscribers: latest.paidSubscribers,
    freeSubscribers: latest.freeSubscribers,
    revenue: latest.revenue,
    views: latest.views,
    paidConversion: safeRate(latest.paidSubscribers, latest.subscribers) * 100,
    subscriberChangePct: pctChange(latest.subscribers, previous.subscribers),
    revenueChangePct: pctChange(latest.revenue, previous.revenue),
    viewsChangePct: pctChange(latest.views, previous.views)
  };
}

export function topPosts(posts = [], limit = 5) {
  return posts.filter(Boolean).map((p) => ({
    id: p.id ?? p.external_id ?? null,
    title: String(p.title ?? "Untitled"),
    views: Math.max(0, num(p.views)),
    likes: Math.max(0, num(p.likes)),
    comments: Math.max(0, num(p.comments)),
    revenue: Math.max(0, num(p.revenue))
  })).sort((a,b) => b.views - a.views).slice(0, limit);
}

export function analysePublication({metrics = [], posts = []} = {}) {
  const summary = summarise(metrics);
  const ranked = topPosts(posts);
  const totalPostViews = ranked.reduce((sum,p) => sum + p.views, 0);
  return {
    summary,
    topPosts: ranked,
    insights: {
      topPost: ranked[0]?.title ?? null,
      topPostShareOfRankedViews: safeRate(ranked[0]?.views ?? 0, totalPostViews) * 100,
      averagePostViews: safeRate(totalPostViews, ranked.length),
      revenuePerView: safeRate(summary.revenue, summary.views)
    }
  };
}