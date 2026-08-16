import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/solar-frontier/',
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    target: 'es2018'
  }
});
