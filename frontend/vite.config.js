// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const FIXED_PORT = 6030;

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      // Always use FIXED_PORT, ignore environment variables or CLI args
      port: FIXED_PORT,
      open: true,
      strictPort: true, // ensures Vite fails if the port is taken
    },
    build: {
      sourcemap: false,
    }
  }
});
