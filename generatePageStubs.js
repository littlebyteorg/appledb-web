const fs = require('fs')
const { parse } = require('node-html-parser')
const osArr = require('./grabData/ios')
const deviceObj = require('./grabData/deviceList')
const deviceArr = Object.keys(deviceObj).map(k => deviceObj[k])
const deviceGroupArr = require('./grabData/deviceGroups')

function mkdirSync(dir) { if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }) } }

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

    fs.writeFile(`./docs/.vuepress/dist/firmware/${os.osStr.replace(/ /g,'-')}/${os.uniqueBuild}.html`, parsedPage.toString(), (err) => {
        if (err) console.log(err)
    })
}

function convertDate(date) {
    let dateStyle = { dateStyle: 'medium'}
    if (date.toString().includes('-')) {
        const dateArr = date.split('-')
        const dateStyleArr = [{ year: 'numeric' }, { year: 'numeric', month: 'short' }, { dateStyle: 'medium' }]
        dateStyle = dateStyleArr[dateArr.length-1]
    }
    return {
        string: new Intl.DateTimeFormat('en-US', dateStyle).format(new Date(date)),
        future: new Date() < new Date(date)
    }
}

for (const dev of deviceArr.concat(deviceGroupArr)) {
    let parsedPage = parse(page)
    
    let showImg = dev.img && dev.img.images && dev.img.images.length > 0
    let imgKey = dev.key
    let imgName = showImg ? dev.img.images[0].id : '0'
    if (dev.devices) {
        let iterateDevice
        for (iterateDevice of dev.devices) if (deviceArr.find(x => x.key == iterateDevice).img.images.length > 0) {
            showImg = true
            imgKey = iterateDevice
            break
        }
    }

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

    let description = `Information lookup for ${dev.name}.`
    if (released) {
        let suffix = 'ed'
        if (released.future) suffix = 'ing'
        description = `Releas${suffix} on ${released.string}`
    }

    parsedPage.querySelectorAll('meta').find(x => x.rawAttrs.includes('name="description"')).rawAttrs = `name="description" content="${description}"`
    parsedPage.querySelector('title').innerHTML = dev.name
    parsedPage.querySelector('h1').innerHTML = dev.name
    parsedPage.querySelector('blockquote').innerHTML = 'Retrieving data...'
    
    if (showImg) {
        parsedPage.querySelectorAll('meta').find(x => x.rawAttrs.includes('property="og:image"')).rawAttrs = `property="og:image" content="https://img.appledb.dev/device@preview/${imgKey}/${imgName}.png"`
    }
    
    fs.writeFile(`./docs/.vuepress/dist/device${dev.groupKey ? '' : '/identifier'}/${(dev.key || dev.groupKey).replace(/ /g,'-').replace(/\//g,'-')}.html`, parsedPage.toString(), (err) => {
        if (err) console.log(err)
    })
}
