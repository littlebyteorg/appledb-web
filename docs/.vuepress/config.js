const { path } = require('@vuepress/utils')
const { registerComponentsPlugin } = require('@vuepress/plugin-register-components')
const { mediumZoomPlugin } = require('@vuepress/plugin-medium-zoom')
const { localTheme } = require('../../emiyl-theme')

module.exports = {
    lang: 'en-US',
    title: 'AppleDB',
    description: 'A database of Apple software and devices.',
  
    theme: localTheme({
      repo: 'littlebyteorg/appledb',
      selectLanguageText: '<i class="fas fa-globe"/>',
      logo: 'https://img.appledb.dev/images@128/logo/0.png',
      logoDark: 'https://img.appledb.dev/images@128/logo/0_dark.png',
      repoLabel: '<i class="fab fa-github icon"></i>',
      adUnits: [],
      navbar: [
        {
          text: 'Devices',
          link: '/device-selection/'
        },
        {
          text: 'Firmware',
          link: '/firmware.html'
        },
        {
          text: 'Credits',
          link: '/credits.html'
        },
        {
          text: 'iOS Guide',
          link: 'https://ios.cfw.guide/'
        },
        {
          text: '<i class="fab fa-discord icon"></i>',
          link: 'https://discord.gg/rtfNDxnJfB'
        },
        {
          text: '<i class="fab fa-twitter icon"></i>',
          link: 'https://twitter.com/AppleDBdev'
        }
      ]
    }),

    plugins: [
      ...[
        './components',
        './components/device',
        './components/components',
        './components/components/list',
        './components/components/propertyBox',
        './components/components/grid',
        './components/components/buttons',
        './components/home'
      ].map(x => registerComponentsPlugin({ componentsDir: path.resolve(__dirname, x), })),
      mediumZoomPlugin({
        selector: ':not(a img)'
      }),
      require('./plugins/deviceListPages/lib'),
      require('./plugins/devicePages/lib'),
      //require('./plugins/firmwarePages/lib'),
      require('./plugins/jailbreakPages/lib'),
      require('./plugins/redirectPlugin/lib'),
      require('./plugins/writeTemp/lib/')
    ],

    shouldPrefetch: false,
  
    head: [
      [ 'meta', { property: 'og:image', content: '/assets/images/splash-23aaron-logo.jpg' } ],
      // [ 'script', { type: 'text/javascript', src: '//cdn.thisiswaldo.com/static/js/13821.js' }],
      [ 'script', { async: true, src: 'https://platform.twitter.com/widgets.js', charset: 'utf-8' }],
      [ 'link', { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.15.4/css/all.css' } ],
      [ 'link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }],
      [ 'link', { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32' }],
      [ 'link', { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16' }],
      [ 'link', { rel: 'manifest', href: '/site.webmanifest' }]
    ],
}
