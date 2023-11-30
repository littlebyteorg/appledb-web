const fs = require('fs')

if (!fs.existsSync('./docs/.vuepress/public/pageData')) fs.mkdirSync('./docs/.vuepress/public/pageData', { recursive: true })

fs.rmSync('./docs/.vuepress/public/pageData', { recursive: true });
fs.mkdirSync('./docs/.vuepress/public/pageData', { recursive: true })

require('./generateFirmware')
//require('./generateDevicePage')