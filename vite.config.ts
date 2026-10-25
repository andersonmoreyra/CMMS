import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Encaminha /api para a API Express (server/, porta 3001) e evita CORS em dev
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
