const dev = require('./deviceList')
const group = require('./deviceGroups')
const devicePath = '/device/identifier/'
const fs = require('fs')
const path = require('path')
const osFilesPath = './appledb/osFiles'

const showSigningArr = [
  'Apple TV Software',
  'audioOS',
  'bridgeOS',
  'HomePod Software',
  'iOS',
  'iPadOS',
  'macOS',
  'tvOS',
  'Studio Display Firmware',
  'visionOS',
  'watchOS'
]

const macIntelPrefixes = [
  'iMac14',
  'iMac15',
  'iMac16',
  'iMac17',
  'iMac18',
  'iMac19',
  'iMac20',
  'iMacPro1',
  'MacBook8',
  'MacBook9',
  'MacBook10',
  'MacBookAir6',
  'MacBookAir7',
  'MacBookAir8',
  'MacBookAir9',
  'MacBookPro11',
  'MacBookPro12',
  'MacBookPro13',
  'MacBookPro14',
  'MacBookPro15',
  'MacBookPro16',
  'Macmini7',
  'Macmini8',
  'MacPro6',
  'MacPro7',
]

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

function handleSDKs(baseItem) {
  var sdkEntries = []
  if (!baseItem.hasOwnProperty('sdks')) return sdkEntries

  baseItem['sdks'].forEach(function(sdk) {
    sdk['version'] = sdk['version'] + ' SDK'
    sdk['uniqueBuild'] = sdk['build'] + '-SDK'
    sdk['released'] = baseItem['released']
    sdk['deviceMap'] = [(sdk['osStr'].indexOf('OS X') >= 0 ? 'macOS' : sdk['osStr']) + ' SDK']
    sdk['sdk'] = true
    sdkEntries.push(sdk)
  })

  return sdkEntries
}

function handleSigning(fw) {
  let showSigning = false;
  if (showSigningArr.includes(fw.osStr) && fw.deviceMap && !fw.rsr) {
    showSigning = [...new Set((fw.sources || []).filter(x => x.type != 'kdk').map(x => x.deviceMap).flat())];
    if (fw.osStr == 'Apple TV Software' && fw.deviceMap.includes('AppleTV1,1')) showSigning = false;
    else if (fw.version.indexOf('Simulator') > -1 || fw.version.indexOf('SDK') > -1) showSigning = false;
    else if (fw.preinstalled) {
      if (!showSigning && Array.isArray(fw.preinstalled)) {
        showSigning = fw.deviceMap.filter(x => !fw.preinstalled.includes(x));
      }
    }
    else if (fw.osStr == 'macOS') {
      if (fw.version.split(".")[0] < "11" || fw.build.startsWith('20A4')) showSigning = false;
      else showSigning = fw.deviceMap.filter(x => !macIntelPrefixes.includes(x.split(",")[0])) || false;
    }
  }

  return showSigning;
}

var osFiles = getAllFiles(osFilesPath)
osFiles = osFiles.filter(file => file.endsWith('.json'));
osFiles = osFiles.map(function(x) {
    const filePathStr = x.split(path.sep)
    const pathStrLength = osFilesPath.split('/').length - 3
    
    return filePathStr.splice(pathStrLength, filePathStr.length).join(path.sep)
})

var osArr = []
for (const file of osFiles) {
  let os = require('../' + file)
  os.showSigning = handleSigning(os);
  if (os.sources) os.sources = os.sources.filter(x => x.type != 'ota')
  osArr.push(os)
}

let createDuplicateEntriesArray = []

for (let i of osArr) {
    if (!i.hasOwnProperty('createDuplicateEntries') && !i.hasOwnProperty('sdks')) continue
    for (const entry of (i.createDuplicateEntries || [])) {
      let ver = { ...i }
      delete ver.createDuplicateEntries
      for (const property in entry) {
        ver[property] = entry[property]
      }
      createDuplicateEntriesArray.push(ver)
      createDuplicateEntriesArray = createDuplicateEntriesArray.concat(handleSDKs(entry))
    }
    delete i.createDuplicateEntries
    createDuplicateEntriesArray = createDuplicateEntriesArray.concat(handleSDKs(i))
}

osArr = osArr
.concat(createDuplicateEntriesArray)
.map(function(x) {
    if (!x.deviceMap) x.deviceMap = []
    if (!x.uniqueBuild) x.uniqueBuild = x.build || x.version
    if (!x.beta) x.beta = false
    if (!x.rc) x.rc = false

    x.path = '/firmware/' + [x.osStr.replace(/ /g,'-'), x.uniqueBuild].join('/') + '.html'
    
    return x
})

if (process.env.npm_config_argv) {
  let args = JSON.parse(process.env.npm_config_argv).original
  if (process.env.npm_lifecycle_script && !args.filter(x => x.includes('limitfw=')).length) args = process.env.npm_lifecycle_script.split(' ')
  if (args.filter(x => x.includes('limitfw=')).length) {
    let limitfwArg = args.find(x => x.includes('limitfw='))
    let fwCount = parseInt(limitfwArg.split('=').slice(1))
    if (fwCount > 0) {
      console.log(`Limited to ${fwCount} firmware${fwCount.length == 1 ? 's' : ''}`)
      osArr = osArr.slice(0,fwCount)
    } else {
      console.log('limitfw integer not valid')
    }
  }
}

osArr = osArr.map(function(x) {
  if (osArr.filter(y => y.osStr == x.osStr && y.version == x.version).length > 1) x.duplicateVersion = true
  return x
})

function formatDeviceName(n) {
  return n
  .replace(/ /g, '-')
  .replace(/\//g,'%2F')
  .replace(/ü/g,'u')
  .replace(/²/g,'2')
  .replace(/³/g,'3')
}

function getLegacyDevicesObjectArray(ver) {
  let obj = {}
  ver.deviceMap.map(x => obj[x] = {})
  if (!ver.sources) return obj

  ver.deviceMap.map(x => {
    const source = ver.sources.filter(y => y.deviceMap.includes(x))[0]
    if (!source) return
    const type = source.type

    const linkArr = source.links
    
    let link
    if (linkArr.length) {
      link = linkArr[0].url
      
      let activeLinks = linkArr.filter(x => x.active)
      if (activeLinks.length > 1) obj[x][type] = activeLinks[0].url
    }

    //obj[x][type] = link
  })
  return obj
}

osArr = osArr.map(function(x) {
  const dlObj = getLegacyDevicesObjectArray(x)

  if (x.deviceMap) {
    var o = {}
    var devArr = x.deviceMap
    .map(function(y) {
      if (!dev[y]) return
      o[y] = {}
      o[y].name = dev[y].name
      o[y].identifier = dev[y].identifier
      o[y].key = dev[y].key
      o[y].group = group.filter(g => g.devices.includes(y))[0]
      o[y].url = devicePath + formatDeviceName(y) + '.html'
      o[y].ipsw = dlObj[y].ipsw
      o[y].ota = dlObj[y].ota
      return o
    })
    x.deviceMap = o
  }

  return x
})

module.exports = osArr;