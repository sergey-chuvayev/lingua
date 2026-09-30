import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg'],
    manifest: {name: 'Lingua — A world of languages', short_name: 'Lingua', theme_color: '#f7f6f0', background_color: '#f7f6f0', display: 'standalone', icons: [{src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any'}]},
    workbox: {globPatterns: ['**/*.{js,css,html,json,geojson,svg,woff2}'], maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, navigateFallbackDenylist: [/^\/data\//]},
  })],
})
