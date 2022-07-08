const iosList = require('../../../../../grabData/ios')

var pageList = []

pageList.push({
    path: '/firmware.html',
    frontmatter: {
      title: `AppleDB Firmwares`,
      description: `AppleDB firmware lookup`,
      chartType: 'firmwareVersionLookup',
      iosList: iosList,
      sidebar: false,
      editLink: false,
      lastUpdated: false,
      contributors: false,
    }
})
  
/*for (const i of iosList) {
    const url = '/' + [i.osStr.replace(/ /g, '-'),i.uniqueBuild].join('/') + '.html'
    pageList.push({
        path: url,
        frontmatter: {
        title: `${i.osStr} ${i.version} ${(i.build != i.version) ? `(${i.build})` : ''}`,
        description: `Information for ${i.osStr} version ${i.version}`,
        chartType: 'firmwareVersion',
        build: i,
        sidebar: false,
        editLink: false,
        lastUpdated: false,
        contributors: false,
        }
    })
}*/

module.exports = pageList