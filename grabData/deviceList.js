const request = require('sync-request')
const fs = require('fs');
const path = require('path');
const p = './appledb/deviceFiles'

let imgJson = []
try {
  const req = request(
    'GET',
    'https://img.appledb.dev/main.json'
  ).getBody('utf8')
  if (!fs.existsSync('./cache')) fs.mkdirSync('./cache')
  fs.writeFileSync('./cache/imgArr.json', req)

  imgJson = JSON.parse(req)
} catch {
  if (fs.existsSync('./cache/imgArr.json'))
    imgJson = require('../cache/imgArr.json')
}

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

function isDir(p) {
  return fs.lstatSync(p).isDirectory()
}

let imgArr = imgJson.map(x => {
  return {
    key: x.key,
    images: x.index
  }
})

for (const file in deviceFiles) {
  const obj = require('..' + path.sep + deviceFiles[file])

  for (const p of ['model','board','identifier']) {
    if (!obj[p]) obj[p] = []
    if (!Array.isArray(obj[p])) obj[p] = [obj[p]]
  }

  obj.name = obj.name || obj.identifier[0] || obj.key
  obj.key = obj.key || obj.identifier[0] || obj.name
  obj.imageKey = obj.imageKey || obj.key

  let imgObj = {
    key: 'logo',
    images: [{
      'id': '0',
      'dark': true
    }]
  }
  let hasImage = false

  let devImgObj = imgArr.find(x => x.key == obj.imageKey && x.images.length)
  if (devImgObj) {
    hasImage = true
    imgObj.key = obj.imageKey
    imgObj.images = devImgObj.images
  }

  obj.img = imgObj
  obj.hasImage = hasImage

  if (obj.info) obj.info = obj.info.map(o => {
    if (o.type != 'Display') return o
    if (o.Resolution && o.Screen_Size) {
      const diagRes = Math.sqrt(Math.pow(o.Resolution.x, 2) + Math.pow(o.Resolution.y, 2))
      const size = parseInt(o.Screen_Size.replace('"',''))
      const ppi = Math.round(diagRes / size)

      let newObj = {}
      newObj.type = o.type
      newObj.Resolution = o.Resolution
      newObj.Screen_Size = o.Screen_Size
      newObj.Pixels_per_Inch = ppi
      for (const i of Object.keys(o).filter(x => x != 'Resolution' || x != 'Screen_Size'))
        newObj[i] = o[i]

      return newObj
    }
  })
  
  deviceObj[obj.key] = obj
}

module.exports = deviceObj;