import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const certPath = path.resolve(__dirname, '../backend/certs/cert.pem')
const keyPath = path.resolve(__dirname, '../backend/certs/key.pem')

const httpsConfig = fs.existsSync(certPath) && fs.existsSync(keyPath)
  ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
  : undefined

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    host: true,
    port: 5173,
    https: httpsConfig
  }
})
