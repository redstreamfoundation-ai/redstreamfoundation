import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackStart(),
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: [
      "@tanstack/start-server-core",
      "@tanstack/start-client-core",
      "@tanstack/react-start",
    ],
  },
  build: {
    commonjsOptions: {
      exclude: [/node_modules\/(@tanstack\/start-server-core)/],
    },
  },
  environments: {
    ssr: {
      build: {
        commonjsOptions: {
          exclude: [/node_modules\/(@tanstack\/start-server-core)/],
        },
      },
    },
  },
});
