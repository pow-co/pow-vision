// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@tresjs/nuxt", '@nuxtjs/plausible', '@unocss/nuxt'],
  plausible: {
    domain: 'pow.vision'
  },
  app: {
    head: {
      script: [
        {
          src: "https://one.relayx.io/relayone.js",
        }
      ]
    }
  }
})
