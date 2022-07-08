const { createPage } = require('@vuepress/core')

var pageList = require('./jailbreakPages')

module.exports = function() {
  return {
    name: 'jailbreak-pages',
    async onInitialized(app) {
      for (const p of pageList) app.pages.push(await createPage(app, p))
    }
  }
}