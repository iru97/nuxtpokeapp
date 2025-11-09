import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin((nuxtApp) => {
  // Only use persisted state on client-side
  if (process.client) {
    nuxtApp.$pinia.use(piniaPluginPersistedstate)
  }
})
