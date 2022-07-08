const { createPage } = require('@vuepress/core')

var pageList = require('./deviceListPages')

module.exports = function() {
  return {
    name: 'device-list-pages',
    async onInitialized(app) {
      for (const p of pageList) app.pages.push(await createPage(app, p))
    }
  }
}