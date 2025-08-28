import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Auction-Website/',
  server: {
    host: true, // Updated to use boolean instead of string
    port: 5173
  }
})
