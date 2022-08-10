const fs = require('fs')
const { parse } = require('node-html-parser')

let page = parse(fs.readFileSync('./docs/.vuepress/dist/404.html', 'utf8'))

page.querySelectorAll('meta').find(x => x.rawAttrs.includes('description')).rawAttrs = `name="description" content="iOS 14.3 18C66"`
page.querySelector('title').innerHTML = 'Title'

function mkdirSync(dir) { if (!fs.existsSync(dir)) { fs.mkdirSync(dir) } }

[
    './docs/.vuepress/dist/firmware',
    './docs/.vuepress/dist/firmware/iOS'
].map(x => mkdirSync(x))

fs.writeFileSync('./docs/.vuepress/dist/firmware/iOS/18C66.html', page.toString())