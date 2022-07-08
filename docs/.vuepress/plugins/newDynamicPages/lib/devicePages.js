const getDevicePage = require('./getDevicePage')
const deviceList = require('../../../../../grabData/deviceList')
const deviceGroups = require('../../../../../grabData/deviceGroups')
const iosList = require('../../../../../grabData/ios')

const devicePath = '/device'
var pageList = []

for (const d of Object.keys(deviceList).map(x => deviceList[x]).filter(x => {
  return !(
    process.env.NODE_ENV === 'development' &&
    x.name === "Beats Solo³ Wireless Mickey's 90th Anniversary Edition"
  )
})) {
  const urlPart = require('./formatDeviceName')(d.key)
  const url = [devicePath, 'identifier', urlPart].join('/') + '.html'
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
  const urlPart = require('./formatDeviceName')(g.name)
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
for (const i of iosList.map(x => Object.keys(x.deviceMap))) devListFromFw.push(...i)
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

module.exports = pageList