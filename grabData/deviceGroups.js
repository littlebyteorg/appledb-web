const fs = require('fs');
const path = require('path');
const p = './appledb/deviceGroupFiles'

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

var deviceFiles = [];
deviceFiles = getAllFiles(p, deviceFiles)
deviceFiles = deviceFiles.filter(file => file.endsWith('.json'));
deviceFiles = deviceFiles.map(function(x) {
  const filePathStr = x.split(path.sep)
  const pathStrLength = p.split('/').length - 3
  
  return filePathStr.splice(pathStrLength, filePathStr.length).join(path.sep)
})
var deviceGroupArr = [];

for (const file of deviceFiles) {
  let deviceGroup = require('..' + path.sep + file)
  if (deviceGroup.key) deviceGroup.groupKey = deviceGroup.key
  
  let toPushArray = [deviceGroup]

  if (Object.keys(deviceGroup).includes('subgroups')) {
    for (let subgroup of deviceGroup.subgroups) {
      subgroup.hideFromDeviceList = true
      toPushArray.push(subgroup)
    }
  }
  
  for (let p of toPushArray) {
    if (p.key) p.groupKey = p.key
    delete p.key
  }

  for (let p of toPushArray) deviceGroupArr.push(p)
}

const deviceObj = require('./deviceList')
const deviceArr = Object.keys(deviceObj).map(key => deviceObj[key])

const devicesInDeviceGroups = deviceGroupArr.map(x => x.devices).flat()
const ungroupedDevices = deviceArr.filter(x => !devicesInDeviceGroups.includes(x.key) && x.group !== false)
const nowPutThemInGroups = ungroupedDevices.map(x => {
  return {
    name: x.name,
    type: x.type,
    devices: [x.key],
    groupKey: x.key,
    imageKey: [x.imageKey]
  }
})

deviceGroupArr = deviceGroupArr
.concat(nowPutThemInGroups)
.map(function(x) {
  if (x.devices) {
    const devArr = x.devices.map(y => {
      const dev = deviceObj[y]
      if (!dev) console.log(`ERROR: Device '${y}' not found`)
      return dev
    }).filter(x => x)
    x.soc = Array.from(new Set(devArr.map(y => y.soc)))
    x.arch = Array.from(new Set(devArr.map(y => y.arch)))
    x.released = Array.from(new Set(devArr.map(y => y.released))).flat()
    .map(x => new Date(x).valueOf()).sort()[0]
  }

  return x
})
.filter(x => x)

deviceGroupsWithoutReleaseDate = deviceGroupArr
.filter(x => !x.released)
.sort((a,b) => {
  if (a.subtype) a.type = [a.type,a.subtype].join('')
  if (b.subtype) b.type = [b.type,b.subtype].join('')

  if (a.type < b.type) return -1
  if (a.type > b.type) return 1

  if (a.name > b.name) return -1
  if (a.name < b.name) return 1

  return 0
})

deviceGroupsWithReleaseDate = deviceGroupArr
.filter(x => x.released)
.sort((a,b) => {
  if (a.subtype) a.type = [a.type,a.subtype].join('')
  if (b.subtype) b.type = [b.type,b.subtype].join('')

  if (a.type < b.type) return -1
  if (a.type > b.type) return 1

  if (a.released < b.released) return 1
  if (a.released > b.released) return -1

  if (a.name > b.name) return -1
  if (a.name < b.name) return 1

  return 0
})

module.exports = [
  ...deviceGroupsWithReleaseDate,
  ...deviceGroupsWithoutReleaseDate
].map(x => {
  if (!x.groupKey) x.groupKey = x.name
  return x
});