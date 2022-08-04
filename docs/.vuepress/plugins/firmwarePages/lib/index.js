const { createPage } = require('@vuepress/core')

var pageList = require('./firmwarePages')

module.exports = function() {
  return {
    name: 'firmware-pages',
    async onInitialized(app) {
      for (const p of pageList) app.pages.push(await createPage(app, p))
    }
  }
}