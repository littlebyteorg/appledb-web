const { createPage } = require('@vuepress/core')

var pageList = require('./devicePages')

module.exports = function() {
  return {
    name: 'device-pages',
    async onInitialized(app) {
      for (const p of pageList) app.pages.push(await createPage(app, p))
    }
  }
}