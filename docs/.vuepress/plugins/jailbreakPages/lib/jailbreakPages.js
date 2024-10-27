const jbList = require('../../../../../grabData/jailbreak')
const jsonDeviceList = require('../../../../../grabData/deviceList')
const groupList = require('../../../../../grabData/deviceGroups')
const iosList = require('../../../../../grabData/ios')

const jbPath = '/jailbreak'
var pageList = []

String.prototype.format = function(vars) {
  let temp = this;
  for (let item in vars)
    temp = temp.replace("${" + item + "}", vars[item]);
  return temp
}

const sortBuilds = (a,b) => {
  releaseTypeMap = {
    "beta": 1,
    "rc": 2,
    "gm": 2,
    "release": 3
  }
  aVersion = a.version.split(" ")
  bVersion = b.version.split(" ")
  aReleaseType = (aVersion[1] || "release").toLowerCase()
  bReleaseType = (bVersion[1] || "release").toLowerCase()
  aReleaseCount = (aVersion[2] || '1')
  bReleaseCount = (bVersion[2] || '1')
  aRawVersion = aVersion[0].split(".")
  bRawVersion = bVersion[0].split(".")
  return bRawVersion[0] - aRawVersion[0] || bRawVersion[1] - aRawVersion[1] || (bRawVersion[2] || '0') - (aRawVersion[2] || '0') || releaseTypeMap[bReleaseType] - releaseTypeMap[aReleaseType] || bReleaseCount - aReleaseCount || b.build - a.build
}

for (const jb of jbList) {
    var redirects = []
    if (jb.hasOwnProperty('alias')) {
      redirects = jb.alias
      if (!Array.isArray(redirects)) redirects = [redirects]
      redirects = redirects.map(x => [jbPath, x].join('/') + '.html')
    }
  
    const urlPart = jb.name.replace(/ /g, '-')
    const url = [jbPath, urlPart].join('/') + '.html'

    const strObj = {
      websiteStr: 'Website: ${websiteLink}',
      wikiStr: 'Wiki: ${wikiLink}',
      guideStr: 'Guide: ${guideLink}',
      typeStr: 'Type: ${type}',
      supportedStrSingle: 'Supported Firmware: ${ver}',
      supportedStr: 'Supported Firmware: ${ver0} to ${ver1}',
      socStr: 'SoC: ${soc}',
      compatibleStr: 'Compatible',
      notCompatibleStr: 'Not compatible',
      naStr: 'N/A'
    }
    
    const extLinkIcon = '<svg class="icon outbound" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" x="0px" y="0px" viewBox="0 0 100 100" width="15" height="15"><path fill="currentColor" d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"></path><polygon fill="currentColor" points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"></polygon></svg>'
    const websiteLink = function() {
      const site = jb.info.website
      if (!site || (!site.url && site.name)) return
      if (!site.url) return site.name
      if (!site.name) site.name = site.url

      var link = `<a ${(site.external) ? 'target="_blank"' : ''} href="${site.url}">${site.name}</a>${(site.external) ? extLinkIcon : ''}`
      return strObj.websiteStr.format({ websiteLink: link })
    }
    const wikiLink = function() {
      const site = jb.info.wiki
      if (!site || (!site.url && site.name)) return
      if (!site.url) return site.name
      if (!site.name) site.name = site.url

      var link = `<a href="${site.url}" target="_blank">${site.name}</a>${extLinkIcon}`
      return strObj.wikiStr.format({ wikiLink: link })
    }
    const guideLink = function() {
      if (!jb.info.guide || jb.info.guide.length < 1) return []
      return jb.info.guide.map(g => {
        if (!g || (!g.url && g.name)) return
        if (!g.url) return g.name
        if (!g.name) g.name = g.url

        var link = `<a href="https://ios.cfw.guide${g.url}" target="_blank">${g.name}</a>${extLinkIcon}`
        return strObj.guideStr.format({ guideLink: link })
      })
    }
    const jbType = function() {
      const type = jb.info.type
      if (!type) return
      else return strObj.typeStr.format({ type: type })
    }
    const supportedFw = function() {
      const firmwares = jb.info.firmwares
      if (!firmwares) return
      if (firmwares[0] == firmwares[1] || !firmwares[1]) return strObj.supportedStrSingle.format({ ver: firmwares[0] })
      else return strObj.supportedStr.format({ ver0: firmwares[0], ver1: firmwares[1]})
    }
    const infoData = [
      websiteLink(),
      wikiLink(),
      ...guideLink(),
      jbType(),
      supportedFw(),
    ].filter(i => i)

    const deviceList = function() {
      const compat = jb.compatibility
      if (!compat) return

      const devList = Array.from(new Set(
        compat
        .map(x => x.devices)
        .map(x => x.map(y => groupList.filter(g => (g.type != 'iPhone' || g.groupKey.toLowerCase().indexOf('series') == -1) && g.devices.includes(y))[0]))
        .flat()
        .map(x => JSON.stringify(x))
      ))
      .filter(x => x)
      .map(x => JSON.parse(x))
      .map(x => {
        if (!x.devices) return

        x.devices = x.devices.map(d => {
          return {
            key: d,
            name: jsonDeviceList[d].name
          }
        })
        
        x.firmwares = x.devices.map(d => {
          var ret = []
          const fwList = compat.filter(c => {
            if (!c.hasOwnProperty('devices')) return false
            else return c.devices.includes(d.key)
          }).map(f => f.firmwares)
          for (var i in fwList) for (var f in fwList[i]) if (!ret.includes(fwList[i][f])) ret.push(fwList[i][f])

          return ret
        })

        var fwDict = {}
        for (var i in x.firmwares) for (var f in x.firmwares[i]) {
          const fwList = iosList.filter(b => b.uniqueBuild == x.firmwares[i][f])
          for (const fw of fwList) {
            if (fw.beta) continue
            const fwDictKey = fw['osStr'] + fw['uniqueBuild']
            if (fwDict.hasOwnProperty(fwDictKey)) continue
            // get rid of sources, we don't need it and it makes files too big
            const pluck = (item, keys) => {
              newItem = {}
              for (const k of keys) {
                newItem[k] = item[k]
              }
              return newItem
            }
            const newFw = pluck(fw, ['osStr', 'path', 'version', 'build', 'uniqueBuild', 'deviceMap'])
            fwDict[fwDictKey] = newFw
          }
        }

        x.firmwares = Object.keys(fwDict).map(key => fwDict[key]).filter(fw => Object.keys(fw.deviceMap).some(r => x.devices.map(x => x.key).includes(r)))
        x.firmwares.sort(sortBuilds)

        return x
      })

      return devList
    }

    const compat = function(devList) {
      const compat = jb.compatibility
      let compatStrObj = {
        compatible: strObj.compatibleStr,
        notCompatible: strObj.notCompatibleStr,
        na: strObj.naStr
      }
      var devObj = {}
      if (!devList) return devObj
      devList.map(function(x) {
        if (!x.hasOwnProperty('devices')) return
        for (var dev of x.devices.map(y => y.key)) {
          devObj[dev] = {}
          for (var fw of x.firmwares) {
            const firmware = fw.uniqueBuild
            devObj[dev][firmware] = compatStrObj.na

            let deviceMap = fw.deviceMap
            if (!deviceMap) continue

            deviceMap = Array.isArray(deviceMap) ? deviceMap : Object.keys(deviceMap)
            if (!deviceMap.includes(dev)) continue

            devObj[dev][firmware] = compatStrObj.notCompatible

            for (var c of compat) {
              if (!c.firmwares || !c.devices) continue
              if (c.firmwares.includes(firmware) && c.devices.includes(dev)) {
                devObj[dev][firmware] = compatStrObj.compatible
                break
              }
            }
          }
        }
      })
      return devObj
    }
  
    let devList = deviceList()
    const compatList = compat(devList)

    // remove deviceMap from devList, we no longer need it and it makes files too big
    if (devList) {
      devList = devList.map(device => {
        device.firmwares = device.firmwares.map(fw => {
          const {deviceMap: _, ...newFw} = fw;
          return newFw
        })
        return device
      })
    }

    pageList.push({
      path: url,
      frontmatter: {
        title: jb.name,
        description: `Compatible devices and software versions for ${jb.name}`,
        chartType: 'jailbreak',
        infoData: infoData,
        deviceList: devList,
        compat: compatList,
        redirect_from: redirects,
        sidebar: false,
        editLink: false,
        lastUpdated: false,
        contributors: false,
      }
    })
  }

  module.exports = pageList