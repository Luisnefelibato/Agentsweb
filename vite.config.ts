import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy para Steve API
      '/steve-api': {
        target: 'https://steveweb.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steve-api/, '')
      },
      // Proxy para Sunpich API
      '/sunpich-api': {
        target: 'https://sunpich.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sunpich-api/, '')
      }
    }
  }
})