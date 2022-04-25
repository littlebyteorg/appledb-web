const { createPage } = require('@vuepress/core')
const { path, fs } = require('@vuepress/utils')

const iosList = require('../../../../../grabData/ios')
const deviceList = require('../../../../../grabData/deviceList')
const deviceGroups = require('../../../../../grabData/deviceGroups')
const jbList = require('../../../../../grabData/jailbreak')
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

var jbPath = '/jailbreak/'
var devicePath = '/device'

var pageList = []

for (const i of iosList) {
  const url = '/' + [i.osStr.replace(/ /g, '-'),i.uniqueBuild].join('/') + '.html'
  pageList.push({
    path: url,
    frontmatter: {
      title: `${i.osStr} ${i.version} ${(i.build != i.version) ? `(${i.build})` : ''}`,
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

  const urlPart = jbList[jb].name.replace(/ /g, '-')
  const url = [jbPath, urlPart].join('/') + '.html'

  pageList.push({
    path: url,
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

const getDevicePage = require('./getDevicePage')

for (const d of Object.keys(deviceList).map(x => deviceList[x])) {
  const urlPart = d.identifier.replace(/ /g, '-')
  const url = [devicePath, urlPart].join('/') + '.html'
  pageList.push(
    getDevicePage({
      name: d.name,
      path: url,
      devArr: d,
      grouped: false
    })
  )
}

for (const g of deviceGroups) {
  const urlPart = g.name.replace(/ /g, '-')
  const url = [devicePath, urlPart].join('/') + '.html'
  pageList.push(
    getDevicePage({
      name: g.name,
      path: url,
      devArr: g.devices.map(x => deviceList[x]),
      grouped: true,
      hideChildren: g.hideChildren
    })
  )
}

var devListFromFw = []
for (const i of iosList.map(x => Object.keys(x.devices))) devListFromFw.push(...i)
devListFromFw = Array.from(new Set(devListFromFw)).sort()

pageList.push(
  getDevicePage({
    name: "Firmware Chart",
    description: 'AppleDB firmware chart',
    path: "/firmwares.html",
    devArr: devListFromFw.map(x => deviceList[x]),
    grouped: true,
    mainList: true
  })
)

pageList.push({
  path: '/device-list.html',
  frontmatter: {
    title: 'Device List',
    description: 'AppleDB device list',
    layout: 'chartLayout',
    chartType: 'deviceList',
    deviceList: deviceList,
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
  const urlPart = t.replace(/ /g, '-')
  const url = `/device-selection/${urlPart}.html`
  pageList.push({
    path: url,
    frontmatter: {
      title: `Device Selection (${t})`,
      description: 'AppleDB device selection',
      layout: 'chartLayout',
      chartType: 'deviceGroup',
      type: t,
      group: deviceGroups.map(x => {
        const devArr = x.devices.map(y => deviceList[y])

        const released = Array.from(new Set(devArr.map(y => y.released)))
        if (released.join() != '') x.released = released.map(y => {
          const releasedArr = y.split('-')
          const dateStyleArr = [{ year: 'numeric'}, { dateStyle: 'medium'}, { dateStyle: 'medium'}]
          return new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(new Date(y))
        })

        const model = Array.from(new Set(devArr.map(y => y.model).flat()))
        if (model.join() != '') x.model = model

        const board = Array.from(new Set(devArr.map(y => y.board).flat()))
        if (board.join() != '') x.board = board

        const identifier = Array.from(new Set(devArr.map(y => (y.identifier != y.name) ? y.identifier : undefined).flat()))
        if (identifier.join() != '') x.identifier = identifier

        return x
      }).filter(x => x.type == t),
      sidebar: false,
      editLink: false,
      lastUpdated: false,
      contributors: false,
    }
  })
})

module.exports = function() {
  return {
    name: 'vuepress-new-dynamic-pages',
    async onInitialized(app) {
      for (const p in pageList) app.pages.push(await createPage(app, pageList[p]))
    },
    onPrepared: async (app) => {
      await app.writeTemp('main.js', `export default ${JSON.stringify(bigJson)}`)
    },
    clientAppEnhanceFiles: path.resolve(__dirname, 'clientAppEnhance.js'),
  }
}