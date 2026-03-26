import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Turning off manualChunks temporarily to fix the 500 resource error
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },
  // Ensure console logs are kept for debugging the deployment
  esbuild: {
    drop: [],
  },
});
