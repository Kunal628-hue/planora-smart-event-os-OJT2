import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('gsap') || id.includes('animejs')) return 'vendor-animation';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
});
