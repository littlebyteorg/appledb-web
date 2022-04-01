const { createPage } = require('@vuepress/core')
const { path } = require('@vuepress/utils')

const iosList = require('../../../json/ios');
const deviceList = require('../../../json/deviceList');
const deviceGroups = require('../../../json/deviceGroups');
const jbList = require('../../../json/jailbreak');
const bigJson = {
  ios: iosList,
  jailbreak: jbList,
  device: deviceList,
  groups: deviceGroups.sort(function(a,b) {
    const c = [a, b].map(x => JSON.stringify(x)).map(x => JSON.parse(x)) // don't ask

    if (c[0].subtype) c[0].type = [c[0].type,c[0].subtype].join('')
    if (c[1].subtype) c[1].type = [c[1].type,c[1].subtype].join('')

    if (c[0].type < c[1].type) return -1
    if (c[0].type > c[1].type) return 1
    
    if (c[0].order > c[1].order) return -1
    if (c[0].order < c[1].order) return 1

    return 0
  })
}

var bigObj = {}
for (const f of iosList) {
  const b = f.build
  const devArr = ((f.devices) ? Object.keys(f.devices) : [])
  bigObj[b] = {}
  for (const d of devArr) {
    bigObj[b][d] = []
    for (const jb of jbList) {
      if (!jb.hasOwnProperty('compatibility')) continue
      for (const c of jb.compatibility) {
        if (!c.firmwares.includes(b)) continue
        if (!c.devices.some(r => devArr)) continue
        if (bigObj[b][d].includes(jb)) continue
        bigObj[b][d].push(jb)
      }
    }
  }
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
  path: '/device-list.html',
  frontmatter: {
    title: 'Device List',
    description: 'AppleDB device list',
    layout: 'chartLayout',
    chartType: 'deviceList',
    deviceList: deviceGroups,
    sidebar: false,
    editLink: false,
    lastUpdated: false,
    contributors: false,
  }
})

pageList.push({
  path: '/device-selection.html',
  frontmatter: {
    title: 'Device Selection',
    description: 'AppleDB device selection',
    layout: 'chartLayout',
    chartType: 'deviceGroupList',
    redirect_from: ['/devices','/devices.html','/device','/device.html'],
    groupList: deviceGroups,
    sidebar: false,
    editLink: false,
    lastUpdated: false,
    contributors: false,
  }
})

Array.from(new Set(deviceGroups.map(x => x.type))).map(function(t) {
  pageList.push({
    path: `/device-selection/${t.toLowerCase().replace(/ /g, '-')}.html`,
    frontmatter: {
      title: `Device Selection (${t})`,
      description: 'AppleDB device selection',
      layout: 'chartLayout',
      chartType: 'deviceGroup',
      type: t,
      group: deviceGroups.filter(x => x.type == t),
      sidebar: false,
      editLink: false,
      lastUpdated: false,
      contributors: false,
    }
  })
})

var devListFromFw = []
for (const i of iosList.map(x => Object.keys(x.devices))) devListFromFw.push(...i)
devListFromFw = Array.from(new Set(devListFromFw)).sort()

pageList.push({
  path: '/firmwares.html',
  frontmatter: {
    title: 'Firmware Chart',
    description: 'AppleDB firmware chart',
    layout: 'chartLayout',
    chartType: 'device',
    device: devListFromFw,
    mainList: true,
    //bigObj: bigObj,
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