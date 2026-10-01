// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  experimental: {
    asyncContext: true
  },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/theme.css', '~/assets/css/main.css'],
  app: {
    head: {
      script: [
        {
          // Aplica o tema da sessão antes da hidratação para evitar flash de tema errado.
          innerHTML:
            "try{if(sessionStorage.getItem('rxf-theme')==='dark')document.documentElement.classList.add('app-dark')}catch(e){}",
          tagPosition: 'head',
        },
      ],
    },
  },
  vite: {
    server: {
      allowedHosts: [
        '.ngrok-free.dev',
        '.loca.lt',
        '.trycloudflare.com',
      ]
    },
    // O pré-bundle do Vite quebra o web worker do MapLibre (maplibre-gl-worker.mjs).
    optimizeDeps: {
      exclude: ['maplibre-gl']
    },
    css: {
      transformer: 'postcss'
    }
  }
})
