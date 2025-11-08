// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,

  // Route rules for optimization
  routeRules: {
    '/': { ssr: true },
    '/pokemons': { ssr: true, swr: 3600 }, // Cache for 1 hour with stale-while-revalidate
    '/pokemon/**': { ssr: true, swr: 86400 }, // Cache for 24 hours
  },

  modules: [
    '@nuxt/fonts',
    'vuetify-nuxt-module',
    '@nuxtjs/tailwindcss'
  ],
  fonts: {
    families: [
      { name: 'Quicksand', provider: 'google' },
      { name: 'Roboto', provider: 'google' },
      { name: 'Inter', provider: 'google', weights: [400, 700] },
      { name: 'Josefin Sans', provider: 'google' },
      { name: 'Lato', provider: 'google', weights: [100, 300] },
      { name: 'Raleway', provider: 'google', weights: [100, 400], styles: ['italic'] }
    ]
  },
  vuetify: {
    moduleOptions: {
      treeshaking: true,
      useIconCDN: true,
      styles: true,
      autoImport: true,
      useVuetifyLabs: true,
    },
    vuetifyOptions: {
      // @TODO: list all vuetify options
    }
  }
})
