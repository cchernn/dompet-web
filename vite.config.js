import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "Dompet",
        short_name: "Dompet",
        description: "Personal finance tracking",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // App-shell only: precache the built JS/CSS/HTML so the app loads
        // offline or on a flaky connection. No runtime caching of API
        // responses -- those always hit the network, so data is never
        // stale. Keep this list in sync with what actually ships in dist/.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2}"],
        // SPA routing: serve the cached shell for any unmatched navigation
        // instead of trying (and failing offline) to fetch a server route.
        navigateFallback: "/index.html",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
