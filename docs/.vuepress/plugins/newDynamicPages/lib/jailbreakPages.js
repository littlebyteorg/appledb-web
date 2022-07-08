const jbList = require('../../../../../grabData/jailbreak')

const jbPath = '/jailbreak'
var pageList = []

for (const jb of jbList) {
    var redirects = []
    if (jb.hasOwnProperty('alias')) {
      redirects = jb.alias
      if (!Array.isArray(redirects)) redirects = [redirects]
      redirects = redirects.map(x => [jbPath, x].join('/') + '.html')
    }
  
    const urlPart = jb.name.replace(/ /g, '-')
    const url = [jbPath, urlPart].join('/') + '.html'
  
    pageList.push({
      path: url,
      frontmatter: {
        title: jb.name,
        description: `Compatible devices and software versions for ${jb.name}`,
        chartType: 'jailbreak',
        jailbreak: jb,
        redirect_from: redirects,
        sidebar: false,
        editLink: false,
        lastUpdated: false,
        contributors: false,
      }
    })
  }

  module.exports = pageList