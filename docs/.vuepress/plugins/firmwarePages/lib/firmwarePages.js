const iosList = require('../../../../../grabData/ios')
const deviceList = require('../../../../../grabData/deviceList')
const jailbreakList = require('../../../../../grabData/jailbreak')

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

function getDevGroupArr(deviceMap, sources) {
    var groupArr = []
    for (const i in deviceMap) {
      if (!groupArr.includes(JSON.stringify(deviceMap[i].group)))
        groupArr.push(JSON.stringify(deviceMap[i].group))
    }
    if (!groupArr || !groupArr[0]) return null
    groupArr = groupArr.filter(x => x).map(x => JSON.parse(x))
    
    groupArr = groupArr.map(function(g) {
      const devices = g.devices.map(function(d) {
        var ipsw
        try {
          ipsw = sources
          .filter(x => x.deviceMap.includes(d) && x.type == 'ipsw')[0]
          .links.filter(x => x.active)
          .sort((a, b) => b.preferred - a.preferred)
          [0].url
        } catch { ipsw = null; }
        
        return {
          name: deviceList[d].name,
          url: `${/device/ + d.replace(/ /g, '-')}`,
          ipsw: ipsw,
        }
      })

      var type = g.type
      if (g.hasOwnProperty('subtype') && g.subtype != g.type) type += ' ' + g.subtype
      
      return {
        name: g.name,
        url: `${/device/ + g.name.replace(/ /g, '-')}`,
        devices: devices,
        order: g.order,
        type: type,
      }
    })

    return groupArr.sort(function(a,b) {
      if (a.type == 'iPhone' && b.type != 'iPhone') return 1
      if (a.type != 'iPhone' && b.type == 'iPhone') return -1

      function alphaSort(x, y, attr) {
        if (x[attr] < y[attr]) return -1
        if (x[attr] > y[attr]) return 1
        return 0
      }
      const sortArr = [
        'type',
        'order',
        'name'
      ]
      for (var i of sortArr) if (alphaSort(a, b, i) != 0) return alphaSort(a, b, i)
      return 0
    }).reverse()
}

function getJailbreakArr(uniqueBuild) {
    return jailbreakList.filter(function(jb) {
      try {
        for (var c in jb.compatibility) {
          if (jb.compatibility[c].firmwares.includes(uniqueBuild))
            return 1
        }
        return 0
      } catch {
        return 0
      }
    })
}

function getJbDevArr(jailbreakArr, devArr, uniqueBuild) {
    var retArr = []
    for (var jb in jailbreakArr) {
      var compat = jailbreakArr[jb].compatibility
      var retDevArr = []
      for (var c in compat) {
        if (!compat[c].firmwares.includes(uniqueBuild)) continue
        for (var device of compat[c].devices) {
          if (!Object.keys(devArr).includes(device)) continue
          device = devArr[Object.keys(devArr).filter(d => d == device)[0]]
          retDevArr.push(device)
        }
      }
      retArr.push(retDevArr)
    }
    return retArr
}

function getReleaseDate(released) {
    if (!released) return -1
    const releasedArr = released.split('-')
    const dateStyleArr = [{ year: 'numeric'}, { dateStyle: 'medium'}, { dateStyle: 'medium'}]
    const ret = new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(new Date(released))
    return ret
}
  
for (const i of iosList) {
    const url = '/' + [i.osStr.replace(/ /g, '-'),i.uniqueBuild].join('/') + '.html'
    const jailbreakArr = getJailbreakArr(i.uniqueBuild)
    pageList.push({
        path: url,
        frontmatter: {
            title: `${i.osStr} ${i.version} ${(i.build != i.version) ? `(${i.build})` : ''}`,
            description: `Information for ${i.osStr} version ${i.version}`,
            chartType: 'firmwareVersion',
            build: i,
            devGroupArr: getDevGroupArr(i.deviceMap, i.sources),
            jailbreakArr: jailbreakArr,
            jbDevArr: getJbDevArr(jailbreakArr, i.deviceMap, i.uniqueBuild),
            released: getReleaseDate(i.released),
            sidebar: false,
            editLink: false,
            lastUpdated: false,
            contributors: false,
        }
    })
}

module.exports = pageList