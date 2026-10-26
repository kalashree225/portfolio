import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Build used only by `npm run resume:pdf`.
 *
 * The HTML entry is a copy of index.html living outside the project root, so
 * Vite keeps everything else out of this build and emits exactly one HTML file
 * plus its assets into dist-print/. Headless Edge then prints that file to
 * public/resume.pdf, which means the PDF and the on-screen résumé are the same
 * component reading the same config.
 */
export default defineConfig({
  root: path.resolve(__dirname, 'scripts/resume-print'),
  base: './',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'dist-print'),
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'scripts/resume-print/index.html'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
