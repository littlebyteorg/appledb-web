const fs = require('fs')
const { parse } = require('node-html-parser')
const osArr = require('./grabData/firmware')
const deviceArr = require('./grabData/device')
const deviceGroupArr = require('./grabData/deviceGroup')
const deviceGroup = require('./grabData/deviceGroup')

function mkdirSync(dir) { if (!fs.existsSync(dir)) { fs.mkdirSync(dir) } }

mkdirSync('./docs/.vuepress/dist/firmware')
Array.from(new Set(osArr.map(x => x.osStr.replace(/ /g,'-')))).map(x => mkdirSync(`./docs/.vuepress/dist/firmware/${x}`))

mkdirSync('./docs/.vuepress/dist/device')
mkdirSync('./docs/.vuepress/dist/device/identifier')

const page = fs.readFileSync('./docs/.vuepress/dist/404.html', 'utf8')
.replace('<div class="theme-container">','<div class="theme-container no-sidebar">')
.replace('<div class="not-found-section theme-default-content">','<main class="page"><div class="theme-default-content">')
.replace('Take me home</a></div>','Take me home</a></div></main>')

for (const os of osArr) {
    let parsedPage = parse(page)

    parsedPage.querySelectorAll('meta').find(x => x.rawAttrs.includes('name="description"')).rawAttrs = `name="description" content="Information for ${os.osStr} version ${os.version}"`
    parsedPage.querySelector('title').innerHTML = `${os.osStr} ${os.version} ${(os.build && os.build != os.version) ? `(${os.build})` : ''}`
    parsedPage.querySelector('h1').innerHTML = `${os.osStr} ${os.version}`
    parsedPage.querySelector('blockquote').innerHTML = 'Retrieving data...'

    /*fs.writeFile(`./docs/.vuepress/dist/firmware/${os.osStr.replace(/ /g,'-')}/${os.uniqueBuild}.html`, parsedPage.toString(), (err) => {
        if (err) console.log(err)
    })*/
}

function convertDate(date) {
    let dateStyle = { dateStyle: 'medium'}
    if (date.toString().includes('-')) {
        const dateArr = date.split('-')
        const dateStyleArr = [{ year: 'numeric'}, { dateStyle: 'medium'}, { dateStyle: 'medium'}]
        dateStyle = dateStyleArr[dateArr.length-1]
    }
    return new Intl.DateTimeFormat('en-US', dateStyle).format(new Date(date))
}

for (const dev of deviceArr.concat(deviceGroupArr)) {
    let parsedPage = parse(page)

    let released
    if (!dev.released) released = undefined
    else {
        if (Array.isArray(dev.released)) released = dev.released.sort((a,b) => {
            const date = [a,b].map(x => new Date(x))
            if (date[0] < date[1]) return -1
            if (date[0] < date[1]) return 1
            return 0
        }).map(x => convertDate(x))[0]
        else released = convertDate(dev.released)
    }

    parsedPage.querySelectorAll('meta').find(x => x.rawAttrs.includes('name="description"')).rawAttrs = `name="description" content="Information lookup for ${dev.name}."`
    parsedPage.querySelector('title').innerHTML = dev.name
    parsedPage.querySelector('h1').innerHTML = dev.name
    parsedPage.querySelector('blockquote').innerHTML = 'Retrieving data...'

    fs.writeFile(`./docs/.vuepress/dist/device${dev.groupKey ? '' : '/identifier'}/${(dev.key || dev.groupKey).replace(/ /g,'-').replace(/\//g,'-')}.html`, parsedPage.toString(), (err) => {
        if (err) console.log(err)
    })
}
