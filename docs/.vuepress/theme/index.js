const { path } = require('@vuepress/utils')

module.exports = {
  name: 'vuepress-theme-local',
  extends: '@vuepress/theme-default',
  alias: {
    '@theme/Home.vue': path.resolve(__dirname, './components/Home.vue'),
    '@theme/HomeHero.vue': path.resolve(__dirname, './components/HomeHero.vue'),
  },
}