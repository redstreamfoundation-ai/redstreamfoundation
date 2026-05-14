#!/usr/bin/env node
/**
 * Post-deployment smoke test.
 *
 * Usage:
 *   node scripts/smoke-test.mjs [baseUrl]
 *
 * Examples:
 *   node scripts/smoke-test.mjs https://redstreamfoundation.org
 *   BASE_URL=https://redstreamfoundation.lovable.app node scripts/smoke-test.mjs
 *
 * Exits with code 0 if every route returns an acceptable status,
 * non-zero otherwise (so it can fail a CI/post-deploy step).
 */

const baseUrl = (
  process.argv[2] ||
  process.env.BASE_URL ||
  "https://redstreamfoundation.org"
).replace(/\/$/, "");

// Routes to probe. Acceptable statuses are 2xx and common redirects.
// 404, 5xx, or network failure = test failure.
const routes = ["/", "/admin", "/donor", "/request"];
const ACCEPTABLE = new Set([200, 301, 302, 304, 307, 308]);

async function check(path) {
  const url = `${baseUrl}${path}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: { "user-agent": "redstream-smoke-test/1.0" },
    });
    const ok = ACCEPTABLE.has(res.status);
    return { path, url, status: res.status, ok };
  } catch (err) {
    return { path, url, status: 0, ok: false, error: err.message };
  }
}

const results = await Promise.all(routes.map(check));

let failed = 0;
for (const r of results) {
  const tag = r.ok ? "OK  " : "FAIL";
  const extra = r.error ? ` (${r.error})` : "";
  console.log(`[${tag}] ${r.status}  ${r.url}${extra}`);
  if (!r.ok) failed++;
}

console.log(
  `\n${results.length - failed}/${results.length} routes healthy on ${baseUrl}`,
);

if (failed > 0) {
  console.error(`\n❌ Smoke test failed: ${failed} route(s) returned an unexpected status.`);
  process.exit(1);
}
console.log("\n✅ Smoke test passed.");