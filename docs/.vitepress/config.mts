import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Comet",
  description: "Documentation for Comet v2.0",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Setup', link: '/setup/overview' },
      { text: 'API', link: '/api/comet' }
    ],

    sidebar: {
      "/setup/": [{
        text: 'Getting Started',
        items: [
          { text: 'Overview', link: '/setup/overview' },
        ]
      }],
      "/api/": [{
        text: 'Getting Started',
        items: [
          { text: 'Comet', link: '/api/comet' },
          { text: 'GUI', link: '/api/gui' },
          { text: 'Roblox', link: '/api/studio' },
          { text: 'History', link: '/api/history' },
        ]
      }],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/neohertz/comet' }
    ]
  }
})
