import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => ({
  // Only the public Pages preview needs the project sub-path.
  // Local dev and versioned static release archives retain their root base.
  base: mode === 'pages' ? '/FLUXCUE/' : '/',
  plugins: [vue()],
  server: { host: '127.0.0.1' },
  build: {
    // Isolate the 3D renderer from controls and the editor runtime.
    // This changes bundling only; lighting output remains disabled.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/examples/jsm/')) return 'three-controls';
          if (id.includes('/node_modules/three/')) return 'three-core';
          if (id.includes('/node_modules/vue/') || id.includes('/node_modules/@vue/')) return 'vue-runtime';
        },
      },
    },
  },
}));
