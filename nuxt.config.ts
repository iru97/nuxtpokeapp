// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  modules: [['@nuxtjs/google-fonts', {
        families: {
          Roboto: true,
          Inter: [400, 700],
           'Josefin+Sans': true,
          Lato: [100, 300],
          Raleway: {
            wght: [100, 400],
            ital: [100]
          },
          Quicksand: true
        }
    }],
    ['@invictus.codes/nuxt-vuetify', {
      vuetifyOptions: {
        // @TODO: list all vuetify options
      },
      moduleOptions: {
        /* nuxt-vuetify module options */
        treeshaking: true,
        useIconCDN: true,
  
        /* vite-plugin-vuetify options */
        styles: true,
        autoImport: true,
        useVuetifyLabs: true, 
      }
    }],
    '@nuxtjs/tailwindcss']
})
