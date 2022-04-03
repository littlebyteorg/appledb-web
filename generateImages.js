const path = require('path')
const fs = require('fs')
const sharp = require("sharp")
const { create } = require('domain')

const resizeArr = [256,512,1024]

const imgPath = path.resolve(__dirname, "docs/.vuepress/public/assets/images/")
const dirPath = path.join(imgPath, 'device')
const lowResDirPath = path.join(imgPath, 'device-lowres')

function getPngs(p) {
  return fs.readdirSync(p, function (err, files) {
    var retArr = []
    files.forEach(f => retArr.push(f))
    retArr = retArr
    return retArr
  }).filter(x => x.endsWith('.png'))
}

const dirArr = getPngs(dirPath)
const lowResDirArr = getPngs(lowResDirPath).filter(x => !dirArr.includes(x))

async function createPng(img, res, dir) {
  try {
    const outDir = path.join(imgPath, `device@${res}`)
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

    await sharp(path.join(dir, img))
      .resize(res)
      .toFile(path.join(outDir, path.basename(img)))
  } catch (err) {
    console.log(img, err)
  }
}

for (const res of resizeArr) {
  for (const img of dirArr) createPng(img, res, dirPath)
  for (const img of lowResDirArr) createPng(img, res, lowResDirPath)
}