const fs = require('fs')

if (!fs.existsSync('./docs/.vuepress/public')) fs.mkdirSync('./docs/.vuepress/public')
if (!fs.existsSync('./docs/.vuepress/public/pageData')) fs.mkdirSync('./docs/.vuepress/public/pageData')

fs.rmSync('./docs/.vuepress/public/pageData', { recursive: true });
fs.mkdirSync('./docs/.vuepress/public/pageData')

const osArr = require('./generateFirmware')
