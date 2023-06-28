// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@tresjs/nuxt", '@nuxtjs/plausible'],

  plausible: {
    domain: 'pow.vision'
  }
})
