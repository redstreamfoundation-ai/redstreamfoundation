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

// Routes to probe. The script follows redirects and then validates that:
//   1. final status is 200, and
//   2. the final URL path matches one of the allowed paths for that route.
//
// `/` is allowed to land on `/` (Coming Soon on the live domain) or `/home`
// (preview / non-live domains where it auto-redirects). Every other route
// must resolve to itself.
const routes = [
  { path: "/", allowedFinalPaths: ["/", "/home"] },
  { path: "/admin", allowedFinalPaths: ["/admin"] },
  { path: "/donor", allowedFinalPaths: ["/donor"] },
  { path: "/request", allowedFinalPaths: ["/request"] },
];

async function check({ path, allowedFinalPaths }) {
  const url = `${baseUrl}${path}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": "redstream-smoke-test/1.0" },
    });
    const finalUrl = new URL(res.url);
    const finalPath = finalUrl.pathname.replace(/\/$/, "") || "/";
    const statusOk = res.status === 200;
    const pathOk = allowedFinalPaths
      .map((p) => p.replace(/\/$/, "") || "/")
      .includes(finalPath);
    return {
      path,
      url,
      status: res.status,
      finalUrl: res.url,
      finalPath,
      ok: statusOk && pathOk,
      reason: !statusOk
        ? `status ${res.status} (expected 200)`
        : !pathOk
          ? `landed on ${finalPath} (expected one of ${allowedFinalPaths.join(", ")})`
          : "",
    };
  } catch (err) {
    return { path, url, status: 0, ok: false, reason: err.message };
  }
}

const results = await Promise.all(routes.map(check));

let failed = 0;
for (const r of results) {
  const tag = r.ok ? "OK  " : "FAIL";
  const extra = r.ok ? "" : ` — ${r.reason}`;
  console.log(
    `[${tag}] ${r.status}  ${r.url} -> ${r.finalUrl ?? "(no response)"}${extra}`,
  );
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