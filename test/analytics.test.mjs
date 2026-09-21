import test from "node:test";
import assert from "node:assert/strict";
import { safeRate, pctChange, normaliseDailyMetrics, summarise, topPosts, analysePublication } from "../analytics/index.mjs";

test("safeRate handles zero denominator", () => assert.equal(safeRate(10, 0), 0));
test("safeRate handles nulls", () => assert.equal(safeRate(null, 5), 0));
test("pctChange returns null for non-zero change from zero baseline", () => assert.equal(pctChange(10, 0), null));
test("pctChange handles zero to zero", () => assert.equal(pctChange(0, 0), 0));
test("normaliseDailyMetrics drops malformed rows and clamps negatives", () => {
  const rows = normaliseDailyMetrics([{date:"2026-09-20",subscribers:-2,paid_subscribers:null,revenue:-4},null,{subscribers:4}]);
  assert.deepEqual(rows, [{date:"2026-09-20",subscribers:0,paidSubscribers:0,freeSubscribers:0,revenue:0,views:0,newSubscribers:0,unsubscribes:0}]);
});
test("summarise uses the latest row and previous row as baseline", () => {
  const s = summarise([{date:"2026-09-19",subscribers:100,paid_subscribers:10,revenue:50,views:1000},{date:"2026-09-20",subscribers:120,paid_subscribers:15,revenue:75,views:1500}]);
  assert.equal(s.paidConversion, 12.5);
  assert.equal(s.subscriberChangePct, 20);
  assert.equal(s.revenueChangePct, 50);
});
test("summarise does not self-reference the latest row", () => {
  const s = summarise([{date:"2026-09-20",subscribers:100,paid_subscribers:10}]);
  assert.equal(s.subscriberChangePct, 0);
});
test("topPosts sorts by views and limits output", () => {
  const p = topPosts([{title:"A",views:2},{title:"B",views:9},{title:"C",views:4}],2);
  assert.deepEqual(p.map(x=>x.title),["B","C"]);
});
test("analysePublication returns safe zeroes for empty input", () => {
  const a = analysePublication();
  assert.equal(a.summary.subscribers,0);
  assert.equal(a.insights.topPost,null);
  assert.equal(a.insights.averagePostViews,0);
});
