import { defineConfig } from '@tanstack/react-start/config'

export default defineConfig({
  deployment: {
    preset: 'vercel',
    serverEntry: 'app/server.tsx',
    clientEntry: 'app/client.tsx',
  },
  server: {
    preset: 'vercel'
  }
})