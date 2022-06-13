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

for (const file in deviceFiles) {
  deviceGroupArr.push(require('..' + path.sep + deviceFiles[file]));
}

deviceGroupArr = deviceGroupArr.map(function(x) {
  if (x.devices) {
    const devArr = x.devices.map(y => {
      const dev = require('./deviceList')[y]
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

module.exports = deviceGroupArr;