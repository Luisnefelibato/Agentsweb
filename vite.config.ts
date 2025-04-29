import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Escuchar en todas las interfaces de red
    port: 5173, // Puerto por defecto
    strictPort: false, // Permite usar otro puerto si el 5173 está ocupado
    open: true, // Abrir automáticamente el navegador
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