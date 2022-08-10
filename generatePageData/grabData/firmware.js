const fs = require('fs')
const path = require('path')
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

var osFiles = []
osFiles = getAllFiles(p, osFiles)
osFiles = osFiles.filter(file => file.endsWith('.json'));
osFiles = osFiles.map(function(x) {
    const filePathStr = x.split(path.sep)
    const pathStrLength = p.split('/').length - 3
    
    return filePathStr.splice(pathStrLength, filePathStr.length).join(path.sep)
})

var osArr = []
for (const file in osFiles) osArr.push(require('../../' + osFiles[file]))

let createDuplicateEntriesArray = []

for (let i of osArr) {
    if (!i.hasOwnProperty('createDuplicateEntries')) continue
    for (const entry of i.createDuplicateEntries) {
      let ver = { ...i }
      delete ver.createDuplicateEntries
      for (const property in entry) {
        ver[property] = entry[property]
      }
      createDuplicateEntriesArray.push(ver)
    }
    delete i.createDuplicateEntries
}

module.exports = osArr
.concat(createDuplicateEntriesArray)
.map(function(x) {
    if (!x.deviceMap) x.deviceMap = []
    if (!x.uniqueBuild) x.uniqueBuild = x.build
    if (!x.beta) x.beta = false
    return x
})