import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Prevent Vite from pre-bundling these ESM-only packages —
    // they rely on top-level await and dynamic imports that the
    // optimizer can't handle correctly.
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  server: {
    headers: {
      // Required for SharedArrayBuffer (ffmpeg multi-thread) — harmless for single-thread
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
