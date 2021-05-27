export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'ft_transcendence',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/css/fonts'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    // { src: '~/plugins/socket.io.ts', mode: 'client' }
    {
      src: '~/plugins/socket.io.extended.js',
      mode: 'client',
    }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    // https://www.npmjs.com/package/@nuxtjs/fontawesome
    '@nuxtjs/fontawesome',
    // https://www.npmjs.com/package/@nuxtjs/google-fonts
    '@nuxtjs/google-fonts',
  ],

  fontawesome: {
    icons: {
      solid: true,
    }
  },

  googleFonts: {
    inter: true,
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/toast',
  ],

  toast: {
    position: 'top-center',
    duration: 3000,
    progressBar: true
  },

  auth: {
    localStorage: false,
    cookie: {
      prefix: 'auth.',
      options: {
        path: '/',
        maxAge: 10800
      }
    },
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'access_token',
          required: true,
          type: 'Bearer',
          maxAge: 7200,
        },
        refreshToken: {
          property: 'refresh_token',
          maxAge: 60 * 60 * 24 * 30
        },
        user: {
          property: false,
          autoFetch: true
        },
        endpoints: {
          login: { url: '/auth/42/token', method: 'post' },
          user: { url: '/auth/42/me', method: 'get' },
          refresh: { url: '/auth/42/refresh', method: 'post' },
          logout: false
        }
      },
      fortytwo: {
        scheme: 'oauth2',
        endpoints: {
          authorization: 'https://api.intra.42.fr/oauth/authorize',
        },
        responseType: 'code',
        grantType: 'authorization_code',
        state: '8KweTmHsb13KNHZny4XCrZySP8Q=',
        redirectUri: process.env.OAUTH_REDIRECT_URL,
        clientId: process.env.FORTYTWO_OAUTH_UID,
      },
    }
  },

  axios: {
    baseURL: process.env.SSR_BACKEND_BASE_URL,
    browserBaseURL: process.env.BASE_URL
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      plugins: [['@babel/plugin-proposal-private-methods', { loose: true }]],
    },
  }
}
