// Cloudflare Workers build is disabled — this project deploys to Vercel.
// We still use the Lovable wrapper for the rest of its plumbing (tanstackStart,
// React, Tailwind, env injection, dev-server bridge), just without the
// @cloudflare/vite-plugin step.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
});
