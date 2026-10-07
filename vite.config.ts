import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, /api is proxied to nexo-bk so the browser never hits CORS.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: (env.NEXO_API_URL || 'http://127.0.0.1:8000').replace(/\/+(api\/?)?$/, ''), changeOrigin: true },
      },
    },
  }
})
