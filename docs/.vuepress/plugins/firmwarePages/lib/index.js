const { createPage } = require('@vuepress/core')

var pageList = require('./firmwarePages')

/*const osArr = require('../../../../../grabData/ios')
osArr.forEach(os => {
  pageList.push({
    path: `/test/firmware/${os.osStr}/${os.uniqueBuild}.html`,
    frontmatter: {
      title: `${os.osStr} ${os.version} ${(os.build != os.version) ? `(${os.build})` : ''}`,
      description: `Information for ${os.osStr} version ${os.version}`,
      sidebar: false,
      editLink: false,
      lastUpdated: false,
      contributors: false,
    },
    content: `${os.osStr} ${os.version} (${os.build})`,
  })
})*/

module.exports = function() {
  return {
    name: 'firmware-pages',
    async onInitialized(app) {
      for (const p of pageList) app.pages.push(await createPage(app, p))
    }
  }
}