const { createPage } = require('@vuepress/core')
const fs = require('fs')

var pageList = require('./devicePages')

module.exports = function() {
  return {
    name: 'device-pages',
    async onInitialized(app) {
      let mainList = pageList.find(x => x.frontmatter.mainList)
      app.pages.push(await createPage(app, mainList))

      const pArr = [
        './docs/.vuepress/public/pageData/device',
        './docs/.vuepress/public/pageData/device/identifier'
      ]
      
      pArr.map(p => {
        if (!fs.existsSync(p)) fs.mkdirSync(p)
      })

      for (const p of pageList.filter(x => !x.frontmatter.mainList)) {
        let pageKey = p.path.replace('/','').replace('.html','')
        
        fs.writeFile(
          `./docs/.vuepress/public/pageData/${pageKey}.json`,
          JSON.stringify(p),
          function (err) { if (err) throw err
        })
      }
    }
  }
}