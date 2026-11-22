import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Diet Control',
        short_name: 'Diet Control',
        description: 'Diário de alimentação, calorias e macronutrientes com Tabela TACO.',
        theme_color: '#0F0F0F',
        background_color: '#0F0F0F',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  base: process.env.VERCEL ? '/' : '/Diet-Control/',
})