import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://airbnb-api-3mnx.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})