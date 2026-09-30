// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  experimental: {
    asyncContext: true
  },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: {
    // O pré-bundle do Vite quebra o web worker do MapLibre (maplibre-gl-worker.mjs).
    optimizeDeps: {
      exclude: ['maplibre-gl']
    },
    css: {
      transformer: 'postcss'
    }
  }
})
