const fs = require('fs');
const path = require('path');
const p = './appledb/deviceFiles'

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
var deviceObj = {};

let imgArr = []
fs.readdirSync(path.resolve(__dirname, '../apple-device-images/images')).forEach(f => {
  imgArr.push({
    identifier: f.replace('.png',''),
    imgCount: (f.endsWith('.png')) ? 1 : -1,
    dark: false,
  })
})

let folderArr = imgArr.filter(x => x.imgCount < 0)
imgArr = imgArr.filter(x => x.imgCount > 0)

for (const i of folderArr) {
  let folderImgArr = []
  fs.readdirSync(path.resolve(__dirname, `../apple-device-images/images/${i.identifier}`)).forEach(file => {
    folderImgArr.push(file)
  })
  let folderImgCount = folderImgArr.filter(x => !x.endsWith('_dark.png')).length
  let darkBool = folderImgArr.filter(x => x.endsWith('_dark.png')).length > 0
  imgArr.push({
    identifier: i.identifier,
    imgCount: folderImgCount,
    dark: darkBool
  })
}

for (const file in deviceFiles) {
  const obj = require('..' + path.sep + deviceFiles[file])

  if (obj.board && !Array.isArray(obj.board)) obj.board = [obj.board]
  if (!obj.identifier) obj.identifier = obj.name
  
  let imgCount = 1
  let imgDark = false
  let devImgArr = imgArr.filter(x => x.identifier == obj.identifier)
  if (devImgArr.length == 1) {
    let devImg = devImgArr[0]
    imgCount = devImg.imgCount
    imgDark = devImg.dark
  }
  obj.imgCount = imgCount
  obj.imgDark = imgDark
  
  deviceObj[obj.identifier] = obj
}

module.exports = deviceObj;