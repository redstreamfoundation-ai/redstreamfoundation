import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Surfaces the real reason a dev-server startup failed instead of letting
// the health check time out with a generic "did not become healthy" error.
function startupDiagnosticsPlugin() {
  const log = (...args: unknown[]) =>
    console.error("[dev-server]", ...args);

  const onFatal = (kind: string) => (err: unknown) => {
    const e = err as Error;
    log(`FATAL ${kind}:`, e?.stack || e?.message || err);
  };

  process.on("uncaughtException", onFatal("uncaughtException"));
  process.on("unhandledRejection", onFatal("unhandledRejection"));

  return {
    name: "lovable:startup-diagnostics",
    configResolved() {
      log("config resolved, starting dev server…");
    },
    buildStart() {
      log("build start");
    },
    configureServer(server: { httpServer?: { once: (e: string, cb: (err: Error) => void) => void } | null }) {
      server.httpServer?.once("error", (err) => {
        log("httpServer error:", err?.stack || err?.message || err);
      });
    },
    handleHotUpdate() {
      // no-op, kept for future debugging hooks
    },
  };
}

export default defineConfig({
  plugins: [
    startupDiagnosticsPlugin(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
});
