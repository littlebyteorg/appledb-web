const fs = require('fs')
const path = require('path')
const dev = require('./deviceList')
const group = require('./deviceGroups')
const devicePath = '/device/'
const p = 'docs/.vuepress/json/appledb/iosFiles'

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
  const pathStrLength = p.split('/').length - 2
  
  return filePathStr.splice(pathStrLength, filePathStr.length).join(path.sep)
})
var iosArr = [];

for (const file in iosFiles) iosArr.push(require('.' + path.sep + iosFiles[file]));

iosArr = iosArr.map(function(x) {
  x.istvOS = (x.osStr == 'tvOS' || x.osStr == 'Apple TV Software')
  x.isiOS = (x.osStr == 'iOS' || x.osStr == 'iPadOS' || x.osStr == 'iPhoneOS')
  x.iswatchOS = (x.osStr == 'watchOS')
  x.isaudioOS = (x.osStr == 'audioOS')
  
  x.osType = x.osStr
  if (x.osStr == 'iPhoneOS' || x.osStr == 'iPadOS') x.osType = 'iOS'
  else if (x.osStr == 'Apple TV Software') x.osType = 'tvOS'

  if (!x.uniqueBuild) x.uniqueBuild = x.build
  if (!x.beta) x.beta = false
  if (!x.sortVersion) {
    if (x.iosVersion) x.sortVersion = x.iosVersion
    else x.sortVersion = x.version
  }

  x.path = '/' + [x.osStr, x.uniqueBuild].join('/') + '.html'
  
  return x
})

iosArr = iosArr.map(function(x) {
  if (iosArr.filter(y => y.osStr == x.osStr && y.version == x.version).length > 1) x.duplicateVersion = true
  return x
})

iosArr = iosArr.map(function(x) {
  x.relatedFirmwares = []

  function getVer(o) {
    if (o.isiOS) return o.version
    else if (o.istvOS) {
      if (o.iosVersion) return o.iosVersion
      else if (parseInt(o.version.split('.')[0]) > 8) return o.version
      else return -1
    }
    else if (o.iswatchOS && o.iosVersion) return o.iosVersion
    else if (o.isaudioOS) return o.version
    return -1
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
})

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

iosArr = iosArr.sort(function(a,b) {
  var v = [a.version, b.version]
  if (a.sortVersion) v[0] = a.sortVersion
  if (b.sortVersion) v[1] = b.sortVersion
  function getVerStr(x) { return x.split(' ')[0] }
  var compVerStr = versionCompare(getVerStr(v[0]), getVerStr(v[1]))
  if (compVerStr != 0) return compVerStr
  else {
    const verInclGM   = [v[0].includes('GM'), v[1].includes('GM')]
    const verInclBeta = [v[0].includes('beta'), v[1].includes('beta')]
    const verInclRC   = [v[0].includes('RC'), v[1].includes('RC')]
    const beta        = [a.beta, b.beta]
    
    if (beta[1] - beta[0] != 0) return beta[1] - beta[0]
    if (verInclRC[0] - verInclRC[1] != 0) return verInclRC[0] - verInclRC[1]
    if (verInclGM[0] - verInclGM[1] != 0) return verInclGM[0] - verInclGM[1]
    if (verInclBeta[0] - verInclBeta[1] != 0) return verInclBeta[0] - verInclBeta[1]

    if (a.beta && b.beta) {
      const betaNum = [v[0], v[1]]
        .map(x => x.split(' '))
        .map(x => x[2])
        .map(x => (x == undefined) ? '1' : x)
        .map(x => parseFloat(x))
      if (betaNum[0] - betaNum[1] != 0) return betaNum[0] - betaNum[1]
    }
  }
  var dates = new Date(a.released).valueOf() - new Date(b.released).valueOf()
  if (dates != 0) return dates
  if (a.osStr > b.osStr) return -1
  if (a.osStr < b.osStr) return 1
  if (a.build < b.build) return -1
  if (a.build > b.build) return 1
  return 0
})

module.exports = iosArr;