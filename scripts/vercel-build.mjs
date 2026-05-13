// Assembles Vercel Build Output API v3 from `dist/`.
// Input:  dist/client/  (static assets)  +  dist/server/server.js  (SSR Web fetch handler)
// Output: .vercel/output/{config.json, static/, functions/index.func/}
import { cp, mkdir, rm, writeFile, readFile, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const distClient = join(root, "dist", "client");
const distServer = join(root, "dist", "server");
const out = join(root, ".vercel", "output");
const fnDir = join(out, "functions", "index.func");

async function main() {
  if (!existsSync(distClient) || !existsSync(distServer)) {
    throw new Error("dist/client or dist/server missing — run `vite build` first.");
  }

  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  // 1. Static assets
  await cp(distClient, join(out, "static"), { recursive: true });

  // 2. SSR function (Edge runtime — Web Request/Response native)
  await mkdir(fnDir, { recursive: true });
  await cp(distServer, fnDir, { recursive: true });

  // Locate the bundled server entry filename (vite hashes vary across versions).
  // Our src/server.ts default-exports { fetch }. The Vite build emits it as
  // `server.js` by default for the SSR environment.
  const serverEntryCandidates = ["server.js", "index.js"];
  let serverEntry = null;
  for (const c of serverEntryCandidates) {
    try {
      await access(join(distServer, c));
      serverEntry = c;
      break;
    } catch {}
  }
  if (!serverEntry) {
    throw new Error(
      `Could not find server entry in dist/server/. Looked for: ${serverEntryCandidates.join(", ")}`
    );
  }

  // Edge function shim: re-export fetch from the bundled server entry.
  await writeFile(
    join(fnDir, "entry.js"),
    `import handler from "./${serverEntry}";\nexport default { fetch: (req, ctx) => handler.fetch(req, {}, ctx) };\n`
  );

  await writeFile(
    join(fnDir, ".vc-config.json"),
    JSON.stringify(
      {
        runtime: "edge",
        entrypoint: "entry.js",
      },
      null,
      2
    )
  );

  // 3. Top-level config — route everything that isn't a static file to the SSR fn.
  await writeFile(
    join(out, "config.json"),
    JSON.stringify(
      {
        version: 3,
        routes: [
          { handle: "filesystem" },
          { src: "/(.*)", dest: "/index" },
        ],
      },
      null,
      2
    )
  );

  console.log("✓ Vercel Build Output assembled at .vercel/output");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});