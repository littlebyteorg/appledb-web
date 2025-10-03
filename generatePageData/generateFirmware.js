const osArr = require('./grabData/firmware.js')
const deviceGroupArr = require('./grabData/deviceGroup.js')
const deviceArr = require('./grabData/device.js')
const jailbreakArr = require('./grabData/jailbreak.js')
const request = require('sync-request')
const fs = require('fs')

if (!fs.existsSync('./docs/.vuepress/public/pageData/firmware')) fs.mkdirSync('./docs/.vuepress/public/pageData/firmware', { recursive: true })

let imgJson = []
try {
    const req = request(
        'GET',
        'https://img.appledb.dev/logos.json'
    ).getBody('utf8')
    if (!fs.existsSync('./cache')) fs.mkdirSync('./cache')
    fs.writeFileSync('./cache/imgLogoArr.json', req)

    imgJson = JSON.parse(req)
} catch (e) {
    if (fs.existsSync('./cache/imgLogoArr.json'))
        imgJson = require('../../cache/imgLogoArr.json')
}

let imgArr = imgJson.map(x => {
    return {
        key: x.key,
        images: x.index
    }
})

function getReleaseDate(released) {
    if (!released) return -1

    // HACK: Add an hour to prevent dates from slipping back a day due to DST
    const dateOffset = (new Date().getTimezoneOffset() * 60 * 1000) + (60 * 60000)
    const currentDate = new Date(released).valueOf()
    const adjustedDate = new Date(currentDate + dateOffset)

    const releasedArr = released.split('-')
    const dateStyleArr = [{ year: 'numeric' }, { year: 'numeric', month: 'short' }, { dateStyle: 'medium' }]
    return new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(adjustedDate)
}

function getOsJailbreakArr(uniqueBuild) {
    return jailbreakArr.filter(jb => {
        if (!jb.compatibility) return false
        return jb.compatibility.some(c => {
            return c.firmwares.includes(uniqueBuild)
        })
    })
}

function getJbDevArr(osJbArr, os) {
    var retArr = []
    for (const jb of osJbArr) {
      var retDevArr = []
      for (const c of jb.compatibility) {
        if (!c.firmwares.includes(os.uniqueBuild)) continue
        retDevArr.push(c.devices.filter(x => os.deviceMap.includes(x)))
      }

      retArr.push(retDevArr)
    }
    return retArr
}

const downloadTextObj = {
    "ipsw": "IPSW",
    "installassistant": "InstallAssistant",
    "ota": "OTA",
    "dmg": "DMG"
}

function getPreferredLink(links) {
    if (!links) return null
    return links.sort((a,b) => {
        if (a.active > b.active) return -1
        if (a.active < b.active) return 1
        if (a.preferred > b.preferred) return -1
        if (a.preferred < b.preferred) return 1
        return 0
    })[0]
}

function getDeviceList(os) {
    const osDevMap = os.deviceMap
    const osMap = (os.osMap || []).length > 1 ? os.osMap : false
    
    let groupArr = []

    function getDownloadLink(device, osName=null) {
        if (!os.sources) return null
        let source
        if (osName) source = os.sources.find(x => x.deviceMap.includes(device) && x.osMap.includes(osName))
        else source = os.sources.find(x => x.deviceMap.includes(device))
        if (!source) return null
        
        let link
        let decryptionKey
        let url
        let active = false
        if (!source.links) {
            url = null
        } else {
            link = getPreferredLink(source.links)
            url = link.url
            active = link.active
            decryptionKey = link.decryptionKey
        }

        return {
            type: source.type,
            text: Object.keys(downloadTextObj).includes(source.type) ? downloadTextObj[source.type] : source.type,
            url: url,
            decryptionKey: decryptionKey,
            filename: url.split('/').slice(-1).join(''),
            size: source.size || -1,
            active: active
        }
    }

    function getDeviceData(device, osName=null) {
        let d = deviceArr.find(x => x.key === device)
        if (!d) console.log(`ERROR: Device '${device}' not found in ${os.osStr} ${os.version} (${os.build})`)

        let link = getDownloadLink(device, osName) || null
        const deviceName = osName ? `${d.name} (${osName})` : d.name
        if (link) link = {
            name: deviceName,
            key: d.key,
            link: link,
            size: link.size,
            active: link.active,
            style: link.style
        }
        
        return {
            name: deviceName,
            key: d.key,
            imageKey: d.imageKey,
            type: d.type,
            img: d.img,
            released: d.released,
            links: [link]
        }
    }

    function alphaSort(x, y, attr) {
        if (x[attr] < y[attr]) return -1
        if (x[attr] > y[attr]) return 1
        return 0
    }

    function dateSort(x, y, attr) {
        let xDate = x[attr]
        let yDate = y[attr]
        if (Array.isArray(xDate)) xDate = xDate.sort()[0]
        if (Array.isArray(yDate)) yDate = yDate.sort()[0]
        if (xDate < yDate) return -1
        if (xDate > yDate) return 1
        return 0
    }

    const sortArr = [
        'type',
        'released',
        'name'
    ]

    for (const device of osDevMap) {
        const deviceGroup = deviceGroupArr.find(x => x.devices.includes(device))
        if (
            !deviceGroup ||
            groupArr.map(x => x.hash).includes(deviceGroup.hash)
        ) continue

        const devicesInDeviceGroup = osDevMap.filter(x => deviceGroup.devices.includes(x))
        if (devicesInDeviceGroup.length < 2) continue

        let children = [];
        if (osMap) for (const osName of osMap) {
            children.push(...devicesInDeviceGroup.map(x => getDeviceData(x, osName)))
        }
        else children = devicesInDeviceGroup.map(x => getDeviceData(x))
        
        const groupData = [...children].sort((a,b) => {
            for (var sort of sortArr) {
                if (sort == 'released') { if (dateSort(a, b, sort) != 0) return dateSort(a, b, sort) * -1 }
                else { if (alphaSort(a, b, sort) != 0) return alphaSort(a, b, sort) }
            }
            return 0
        }).reverse()

        groupArr.push({
            name: deviceGroup.name,
            key: deviceGroup.groupKey.replace(/ /g,'-'),
            children: children,
            subgroups: deviceGroup.subgroups || [],
            type: groupData[0].type,
            released: groupData[0].released,
            links: groupData.map(x => x.links[0]),
            hash: deviceGroup.hash,
            hideChildren: deviceGroup.hideChildren
        })
    }

    let ungroupedDevicesBase = osDevMap
    .filter(x => !groupArr.map(y => y.children).flat().map(x => x.key).includes(x))
    let ungroupedDevices = []
    if (osMap) for (const osName of osMap) ungroupedDevices.push(...ungroupedDevicesBase.map(x => getDeviceData(x, osName)))
    else ungroupedDevices = ungroupedDevicesBase.map(x => getDeviceData(x))
    
    return groupArr.concat(ungroupedDevices).sort((a,b) => {
        for (var sort of sortArr) {
            if (sort == 'released') { if (dateSort(a, b, sort) != 0) return dateSort(a, b, sort) }
            else { if (alphaSort(a, b, sort) != 0) return alphaSort(a, b, sort) }
        }
        return 0
    }).reverse()
}
        
function getImg(dev) {
    let img

    function validateImg(obj) {
        if (!obj.img.images.length) return false
        return {
            key: obj.img.key || obj.imageKey,
            images: obj.img.images
        }
    }

    if (dev.children) {
        for (const child of dev.children)
            if (validateImg(child)) {
                img = validateImg(child)
                break
            }
    } else {
        if (validateImg(dev))
            img = validateImg(dev)
    }

    return img || {
        key: 'logo',
        images: [{id: '0', dark: true}]
    }
}

function getDevicePageData(os) {
    const deviceList = getDeviceList(os)

    function getListEntry(dev, identifier, imageKey) {
        let urlStart = identifier ? '/device/identifier/' : '/device/'

        const img = getImg(dev)
        let links = dev.links.filter(x => x && x.name && x.link && x.link.url)
        let icons = []

        if (links.length == 1 || [...new Set(links.map(x => x.link.url))].length == 1) {
            icons = [{
                class: 'fas fa-fw fa-download',
                link: links[0].link.url,
            }]
            links = links.slice(0,1)
            links[0].label = links[0].link.text
        }

        let retObj = {
            title: dev.name,
            key: dev.key,
            subtitle: (dev.released && dev.released[0]) ? getReleaseDate(Array.isArray(dev.released) ? dev.released[0] : dev.released) : '',
            subgroups: dev.subgroups || [],
            links: links.map(x => { return {
                text: x.label || x.name,
                key: x.key,
                link: x.link.url,
                decryptionKey: x.link.decryptionKey,
                icon: 'fas fa-fw fa-download',
                type: x.link.type,
                size: x.link.size,
                active: x.link.active,
                style: x.link.style
            }}),
            img: img.key,
            imgFlags: {
                internal: true,
                images: img.images,
            },
            icons: icons,
            link: urlStart + require('../docs/.vuepress/plugins/writeTemp/lib/formatDeviceName.js')(dev.key)
        }

        if (dev.hoverLink) retObj.hoverLink = dev.hoverLink
        return retObj
    }
    
    let ret = deviceList.map(x => getListEntry(x, !x.children, x.children ? x.children[0].key : x.key))
    const linkArr = ret.map(x => x.links.map(y => y.link)).flat()
    const hasMultipleLinks = ret.filter(x => x.links.length > 1).length
    const hasSingleLinks = ret.filter(x => x.links.length < 2).length == ret.length

    if (hasMultipleLinks) ret = ret.map(x => {
        x.icons = []

        if (x.subgroups.length) {
            for (let sg of x.subgroups) {
                let filteredLinkArr = x.links.filter(y => sg.devices.includes(y.key))

                if ([...new Set(filteredLinkArr.map(y => y.link))].length == 1 && x.links.length > 2) {
                    let linkObj = filteredLinkArr[0]
                    linkObj.text = sg.name
                    
                    x.links = x.links.filter(y => !sg.devices.includes(y.key))
                    x.links.push(linkObj)
                }
            }
        }

        return x
    })
    else if (hasSingleLinks) ret = ret.map(x => {
        if (linkArr.length == ret.length && [...new Set(linkArr)].length == 1) {
            x.singleDownload = x.links[0]
            x.icons = []
        }
        x.links = []
        return x
    })

    return ret
}

function getJailbreakPageData(os) {
    const osJailbreakArr = getOsJailbreakArr(os.uniqueBuild)
    const jbDevArr = getJbDevArr(osJailbreakArr, os)

    let combinedJbArr = osJailbreakArr.map((x,index) => {
        x.osDeviceMap = Array.from(new Set(jbDevArr[index].flat()))
        return x
    }).filter(x => x.osDeviceMap.length > 0)

    return combinedJbArr.map(jb => {
        let allDevicesSupported = jb.osDeviceMap.length === os.deviceMap.length

        let retObj = {
            text: jb.name,
            link: `/jailbreak/${jb.name.replace(/ /g,'-')}`
        }

        if (allDevicesSupported) {
            retObj.hoverLink = {
                text: 'Supports all devices',
                icon: 'check',
                hideWhenInactive: false
            }
        } else {
            retObj.children = jb.osDeviceMap
            .map(x => deviceArr.find(y => y.key === x))
            .map(x => {
                return {
                    text: x.name,
                    link: `/device/identifier/${x.key}`
                }
            })
            retObj.showLess = 'Hide devices'
            retObj.showMore = 'Show devices'
        }

        return retObj
    })
}

function getTitle(os) {
    if (os.appledbWebImage && imgArr.find(x => x.key == os.appledbWebImage.id)) {
        found_img = imgArr.find(x => x.key == os.appledbWebImage.id)
        img = {
            url: os.appledbWebImage.id,
            align: os.appledbWebImage.align,
            images: found_img.images
        }
    } else {
        img = { url: null, align: 'right', images: []}
    }
    return {
        header: `${os.osStr} ${os.version} ${os.build && os.build != os.version ? ("(" + os.build + ")") : ''}`.trimEnd(),
        subtitle: {
            text: [
                getReleaseDate(os.released) == '-1' ? null : getReleaseDate(os.released),
                os.build ? `<code style="background: none; padding-inline: 2px; font-size: 1em;">${os.build}</code>` : null
            ].filter(x => x).join(' — '),
            tags: [
                {
                    text: 'Release',
                    colour: '#039be5',
                    active: !(os.beta || os.rc || os.internal)
                },
                {
                    text: 'Beta',
                    colour: '#ab47bc',
                    active: os.beta
                },
                {
                    text: 'RC',
                    colour: '#ab47bc',
                    active: os.rc
                },
                {
                    text: 'Internal',
                    colour: '#f0ad05',
                    active: os.internal
                },
                {
                    text: 'RSR',
                    active: os.rsr
                }
            ]
            .filter(x => x.active && x.text)
            .map(x => {
                if (!x.colour) x.colour = ''
                delete x.active
                return x
            })
        },
        image: img
    }
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes || bytes == -1) return false

    const k = 1000
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

for (const os of osArr) {
    let deviceGrid = getDevicePageData(os)
    let singleDownload = []

    if (deviceGrid.filter(x => x.singleDownload).length) {
        singleDownload = [deviceGrid[0].singleDownload]
        let bytes = formatBytes(singleDownload[0].size, 1)
        if (bytes) singleDownload[0].text += ` (${bytes})`
    }

    if (
        os.osStr == 'macOS' &&
        os.sources && 
        os.sources.length == 2 &&
        os.sources.map(x => x.type).every(x => ['ipsw','installassistant'].includes(x))
    ) singleDownload = ['ipsw','installassistant'].map(x => {
        let source = os.sources.find(y => y.type == x)
        let link = getPreferredLink(source.links)
        let ret = {
            text: downloadTextObj[x],
            key: x,
            link: link.url,
            decryptionKey: link.decryptionKey,
            icon: 'fas fa-fw fa-download',
            type: x,
            active: link.active
        }
        let bytes = formatBytes(source.size, 1)
        if (bytes) ret.text += ` (${bytes})`
        return ret
    })

    const linkableArr = ['releaseNotes', 'securityNotes']

    for (const p of linkableArr) {
        if (os[p] && typeof os[p] === 'string') {
            os[p] = {
                'url': os[p],
                'active': true
            }
        }
    }

    if (os.releaseNotes) {
        singleDownload.push({
            text: "Release Notes",
            link: os.releaseNotes.url,
            icon: 'fas fa-fw fa-info',
            active: os.releaseNotes.active,
        })
    }
    if (os.securityNotes) {
        singleDownload.push({
            text: "Security Notes",
            link: os.securityNotes.url,
            icon: 'fas fa-fw fa-lock',
            active: os.securityNotes.active
        })
    }

    let obj = {
        title: getTitle(os),
        sections: [
            {
                type: 'buttons',
                class: 'wrap',
                content: singleDownload
            },
            {
                title: 'Devices',
                type: 'grid',
                class: 'smallTitle',
                content: deviceGrid
            },
            {
                title: 'Jailbreaks',
                type: 'list',
                class: 'smallTitle noListDisc customListDisc',
                content: getJailbreakPageData(os)
            },
        ].filter(x => x.content.length > 0)
    }

    fs.writeFile(`./docs/.vuepress/public/pageData/firmware/${os.osStr.replace(/ /g,'-')};${os.uniqueBuild}.json`, JSON.stringify(obj), function (err) { if (err) throw err})
}