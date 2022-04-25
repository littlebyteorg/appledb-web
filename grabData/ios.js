const fs = require('fs')
const path = require('path')
const dev = require('./deviceList')
const group = require('./deviceGroups')
const devicePath = '/device/'
const p = './appledb/iosFiles'

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

var iosFiles = [];
iosFiles = getAllFiles(p, iosFiles)
iosFiles = iosFiles.filter(file => file.endsWith('.json'));
iosFiles = iosFiles.map(function(x) {
  const filePathStr = x.split(path.sep)
  const pathStrLength = p.split('/').length - 3
  
  return filePathStr.splice(pathStrLength, filePathStr.length).join(path.sep)
})
var iosArr = [];

for (const file in iosFiles) iosArr.push(require('..' + path.sep + iosFiles[file]));

iosArr = iosArr.map(function(x) {
  x.osType = x.osStr
  if (x.osStr == 'iPhoneOS' || x.osStr == 'iPadOS') x.osType = 'iOS'
  else if (x.osStr == 'Apple TV Software') x.osType = 'tvOS'

  if (!x.uniqueBuild) x.uniqueBuild = x.build/*
  return x
})

const uniqueBuildArr = iosArr.map(x => x.uniqueBuild)

iosArr = iosArr.map(function(x) {
  if (!x.uniqueBuildOsType) x.uniqueBuildOsType = x.uniqueBuild
  if (uniqueBuildArr.filter(y => y == x.uniqueBuild).length > 1) x.uniqueBuildOsType = x.uniqueBuild + '-' + x.osType*/
  if (!x.beta) x.beta = false
  if (!x.sortVersion) {
    if (x.iosVersion) x.sortVersion = x.iosVersion
    else x.sortVersion = x.version
  }

  x.path = '/' + [x.osStr.replace(/ /g,'-'), x.uniqueBuild].join('/') + '.html'
  
  return x
})

iosArr = iosArr.map(function(x) {
  if (iosArr.filter(y => y.osStr == x.osStr && y.version == x.version).length > 1) x.duplicateVersion = true
  return x
})

/*iosArr = iosArr.map(function(x) {
  x.relatedFirmwares = []
  if (x.osStr == 'macOS') return x
  return x

  function getVer(o) {
    if (o.iosVersion) return o.iosVersion
    if (
      (
        o.osType == 'tvOS' &&
        !o.iosVersion &&
        parseInt(o.version.split('.')[0]) < 9
      ) || (
        o.osType == 'watchOS' &&
        !o.iosVersion
      )
    ) return -1
    return o.version
  }

  const v0 = getVer(x)
  for (var i of iosArr) {
    if (i.uniqueBuild == x.uniqueBuild && i.osType == x.osType) continue
    var v1 = getVer(i)
    if (v1 < 0) continue
    if (v0 == v1) {
      x.relatedFirmwares.push({
        osStr: i.osStr,
        osType: i.osType,
        version: i.version,
        build: i.build,
        uniqueBuild: i.uniqueBuild,
        duplicateVersion: i.duplicateVersion,
        path: i.path
      })
    }
  }

  return x
})*/

iosArr = iosArr.map(function(x) {
  if (x.devices) {
    var o = {}
    var devArr = Object.keys(x.devices).sort()
    .map(function(y) {
      o[y] = {}
      o[y].name = dev[y].name
      o[y].group = group.filter(g => g.devices.includes(y))[0]
      o[y].url = devicePath + y + '.html'
      o[y].ipsw = x.devices[y].ipsw
      return o
    })
    x.devices = o
  }

  return x
})

function versionCompare(v1, v2, options) {
  var lexicographical = options && options.lexicographical,
      zeroExtend = options && options.zeroExtend,
      v1parts = v1.split('.'),
      v2parts = v2.split('.')

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x)
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) return NaN

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) return 1
    if (v1parts[i] == v2parts[i]) continue
    else if (v1parts[i] > v2parts[i]) return 1
    else return -1
  }

  if (v1parts.length != v2parts.length) return -1
  return 0;
}

/*iosArr = iosArr.sort((a,b) => {
  function compareVal(v1, v2) {
    if (v1 < v2) return -1
    if (v1 > v2) return 1
    else return 0
  }*/
  
  /*const typeDif = compareVal(a.osType, b.osType)
  if (typeDif != 0) return typeDif*/

  /*function getVerStr(x) { return x.includes(' ') ? x : x.split(' ')[0] }
  const verDif = versionCompare(...[a,b].map(x => getVerStr(x.version)))
  if (verDif != 0) return verDif*/

  /*const dateDif = compareVal(new Date(a.released).valueOf(), new Date(b.released).valueOf())
  if (dateDif != 0) return dateDif*/

  /*const buildDif = compareVal(a.build, b.build)
  if (buildDif != 0) return buildDif*/
//})

/*iosArr = iosArr.sort(function(a,b) {
  const osType = [a.osType, b.osType]
  if (osType[0] == osType[1]) {
    var v = [a.version, b.version]
    function getVerStr(x) { return x.includes(' ') ? x : x.split(' ')[0] }
    var compVerStr = versionCompare(getVerStr(v[0]), getVerStr(v[1]))
    if (compVerStr != 0) return compVerStr
    else {
      const verInclGM   = v[0].includes('GM') - v[1].includes('GM')
      const verInclBeta = v[0].includes('beta') - v[1].includes('beta')
      const verInclRC   = v[0].includes('RC') - v[1].includes('RC')
      const beta        = a.beta - b.beta
      
      if (beta != 0) return beta
      if (verInclRC != 0) return verInclRC
      if (verInclGM != 0) return verInclGM
      if (verInclBeta != 0) return verInclBeta

      if (a.beta && b.beta) {
        const betaNum = [v[0], v[1]]
          .map(x => x.split(' '))
          .map(x => x[2])
          .map(x => (x == undefined) ? '1' : x)
          .map(x => parseFloat(x))
        if (betaNum[0] - betaNum[1] != 0) return betaNum[0] - betaNum[1]
      }
    }
  }
  const dates = new Date(a.released).valueOf() - new Date(b.released).valueOf()
  if (dates != 0) return dates*/

  /*if (osType[0] > osType[1]) return -1
  if (osType[0] < osType[1]) return 1
  if (a.build < b.build) return -1
  if (a.build > b.build) return 1*//*
  return 0
})*/

module.exports = iosArr;