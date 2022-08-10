const fs = require('fs')
const { parse } = require('node-html-parser')
const { appInit } = require('vuepress')
const osArr = require('./grabData/firmware')

function mkdirSync(dir) { if (!fs.existsSync(dir)) { fs.mkdirSync(dir) } }

mkdirSync('./docs/.vuepress/dist/firmware')
Array.from(new Set(osArr.map(x => x.osStr))).map(x => mkdirSync(`./docs/.vuepress/dist/firmware/${x}`))
const page = fs.readFileSync('./docs/.vuepress/dist/404.html', 'utf8')
.replace('<div class="theme-container">','<div class="theme-container no-sidebar">')
.replace('<div class="not-found-section theme-default-content">','<main class="page"><div class="theme-default-content">')
.replace('Take me home</a></div>','Take me home</a></div></main>')

for (const os of osArr) {
    let parsedPage = parse(page)

    parsedPage.querySelectorAll('meta').find(x => x.rawAttrs.includes('name="description"')).rawAttrs = `name="description" content="Information for ${os.osStr} version ${os.version}"`
    parsedPage.querySelector('title').innerHTML = `${os.osStr} ${os.version} ${(os.build != os.version) ? `(${os.build})` : ''}`
    parsedPage.querySelector('h1').innerHTML = `${os.osStr} ${os.version} ${(os.build != os.version) ? `(${os.build})` : ''}`
    parsedPage.querySelector('blockquote').innerHTML = 'Retrieving data...'

    fs.writeFile(`./docs/.vuepress/dist/firmware/${os.osStr.replace(/ /g,'-')}/${os.uniqueBuild}.html`, parsedPage.toString(), (err) => {
        if (err) console.log(err)
    })
}
