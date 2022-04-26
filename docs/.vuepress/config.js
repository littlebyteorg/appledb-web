const { path } = require('@vuepress/utils')
const { searchPlugin } = require('@vuepress/plugin-search')
const { localTheme } = require('./theme')

module.exports = {
    lang: 'en-US',
    title: 'AppleDB',
    description: 'A database of Apple software and devices.',
  
    theme: localTheme({
      repo: 'emiyl/appledb',
      selectLanguageText: '<i class="fas fa-globe"/>',
      logo: '/assets/images/logo.png',
      logoDark: '/assets/images/logo_dark.png',
      navbar: [
        {
          text: 'Devices',
          link: '/device-selection.html'
        },
        {
          text: 'Firmwares',
          link: '/firmwares.html'
        },
        {
          text: 'Credits',
          link: '/credits.html'
        },
        {
          text: 'iOS Guide',
          link: 'https://ios.cfw.guide/'
        }
      ]
    }),

    plugins: [
      searchPlugin({
        locales: {
          '/': {
            placeholder: 'Search',
          },
        }
      }),
      require('./plugins/newDynamicPages/lib/'),
    ],
  
    head: [
      [ 'meta', { property: 'og:image', content: '/assets/images/splash-23aaron-logo.jpg' } ],
      [ 'link', { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.6.1/css/all.css' } ],
    ],
}