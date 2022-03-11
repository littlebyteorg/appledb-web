const { createPage } = require('@vuepress/core')
const { path } = require('@vuepress/utils')

var iosList = require('../../../json/ios');
var deviceList = require('../../../json/deviceList');
var deviceGroups = require('../../../json/deviceGroups');
var jbList = require('../../../json/jailbreak');
var bigJson = {
  ios: iosList,
  jailbreak: jbList,
  device: deviceList,
  groups: deviceGroups,
}

var jbPath = '/jailbreak/'
var devicePath = '/device/'

var pageList = []

for (const i of iosList) {
  pageList.push({
    path: `/${i.osType}/${i.uniqueBuild}.html`,
    frontmatter: {
      title: `${i.osStr} ${i.version} (${i.build})`,
      description: `Information for ${i.osStr} version ${i.version}`,
      layout: 'chartLayout',
      chartType: 'firmware',
      build: i,
      sidebar: false,
      editLink: false,
      lastUpdated: false,
      contributors: false,
    }
  })
}

for (var jb in jbList) {
  var redirects = []
  if (jbList[jb].hasOwnProperty('alias')) {
    redirects = jb.alias
    if (!Array.isArray(redirects)) redirects = [redirects]
    redirects = redirects.map(x=> jbPath + x)
  }

  pageList.push({
    path: `${jbPath}${jbList[jb].name.replace(/ /g, '-')}.html`,
    frontmatter: {
      title: jbList[jb].name,
      description: `Compatible devices and software versions for ${jbList[jb].name}`,
      layout: 'chartLayout',
      chartType: 'jailbreak',
      jailbreak: jbList[jb],
      redirect_from: redirects,
      sidebar: false,
      editLink: false,
      lastUpdated: false,
      contributors: false,
    }
  })
}

for (var d in deviceList) {
  pageList.push({
    path: `${devicePath}${d}.html`,
    frontmatter: {
      title: `${deviceList[d].name}`,
      description: `Information lookup for ${deviceList[d].name}`,
      layout: 'chartLayout',
      chartType: 'device',
      device: [d],
      sidebar: false,
      editLink: false,
      lastUpdated: false,
      contributors: false
    }
  })
}

for (var g in deviceGroups) {
  pageList.push({
    path: `${devicePath}${deviceGroups[g].name.replace(/ /g,'-')}.html`,
    frontmatter: {
      title: `${deviceGroups[g].name}`,
      description: `Information lookup for ${deviceGroups[g].name}`,
      layout: 'chartLayout',
      chartType: 'device',
      device: deviceGroups[g].devices,
      name: deviceGroups[g].name,
      sidebar: false,
      editLink: false,
      lastUpdated: false,
      contributors: false
    }
  })
}

pageList.push({
  path: '/',
  frontmatter: {
    title: 'Firmware Chart',
    description: 'AppleDB Firmware Chart',
    layout: 'chartLayout',
    chartType: 'device',
    device: Object.keys(deviceList),
    sidebar: false,
    editLink: false,
    lastUpdated: false,
    contributors: false,
  }
})

module.exports = function() {
  return {
    name: 'vuepress-new-dynamic-pages',
    async onInitialized(app) {
      for (const p in pageList) app.pages.push(await createPage(app, pageList[p]))
    },
    onPrepared: async (app) => {
      await app.writeTemp('main.js', `export default ${JSON.stringify(bigJson)}`)
    }
  }
}