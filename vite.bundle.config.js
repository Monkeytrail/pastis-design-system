import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../portfolio26/public',
    emptyOutDir: false,
    lib: {
      entry: 'src/index.js',
      name: 'Pastis',
      fileName: () => 'pastis.js',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
