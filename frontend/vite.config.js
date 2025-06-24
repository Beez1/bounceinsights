import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enables Fast Refresh
      fastRefresh: true,
    }),
  ],
  server: {
    // Enable HMR
    hmr: true,
    // Enable auto-reloading
    watch: {
      usePolling: true,
    },
    // Host settings for network access
    host: true,
    port: 5173,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
}) 