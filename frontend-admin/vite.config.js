import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3001,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});