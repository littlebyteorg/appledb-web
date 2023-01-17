const osArr = require('./grabData/firmware')
const deviceGroupArr = require('./grabData/deviceGroup')
const deviceArr = require('./grabData/device')
const jailbreakArr = require('./grabData/jailbreak.js')
const fs = require('fs')

fs.mkdirSync('./docs/.vuepress/public/pageData/firmware')

function getReleaseDate(released) {
    if (!released) return -1

    const dateOffset = new Date().getTimezoneOffset() * 60 * 1000
    const currentDate = new Date(released).valueOf()
    const adjustedDate = new Date(currentDate + dateOffset)

    const releasedArr = released.split('-')
    const dateStyleArr = [{ year: 'numeric'}, { dateStyle: 'medium'}, { dateStyle: 'medium'}]
    return new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(adjustedDate)
}

function getInfoObj(os) {
    return [
        /*{
            title: 'Version',
            string: '${i}',
            value: [os.osStr,os.version].filter(x => x).join(' ')
        },*/
        {
            title: 'Build',
            string: '${i}',
            value: os.build
        }
        /*{
            title: 'Released',
            string: '${i}',
            value: getReleaseDate(os.released)
        }*/
    ].map(x => {
        if (!Array.isArray(x.value)) x.value = [x.value]
        return x
    }).filter(x => x.value[0])
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


function getDeviceList(os) {
    const osDevMap = os.deviceMap
    
    let groupArr = []

    function getUrl(links) {
        if (!links) return null
        return links.sort((a,b) => {
            if (a.active > b.active) return -1
            if (a.active < b.active) return 1
            if (a.preferred > b.preferred) return -1
            if (a.preferred < b.preferred) return 1
            return 0
        })[0].url
    }

    function getDownloadLink(device) {
        if (!os.sources) return null
        const source = os.sources.find(x => x.deviceMap.includes(device))
        if (!source) return null
        
        let url
        if (!source.links) url = null
        else url = getUrl(source.links)

        let downloadTextObj = {
            "ipsw": "IPSW",
            "installassistant": "InstallAssistant",
            "ota": "OTA"
        }

        let downloadText = `<a href="${url}"><i class="fas fa-download" style="margin-right: .4em;"></i>Download `
        if (Object.keys(downloadTextObj).includes(source.type)) downloadText += downloadTextObj[source.type] + '</a>'
        else downloadText += source.type

        return {
            text: downloadText
        }
    }

    function getDeviceData(device) {
        let d = deviceArr.find(x => x.key === device)
        if (!d) console.log(`ERROR: Device '${device}' not found in ${os.osStr} ${os.version} (${os.build})`)

        let hoverLink = getDownloadLink(device) || null
        
        return {
            name: d.name,
            key: d.key,
            type: d.type,
            released: d.released,
            hoverLink: hoverLink
        }
    }

    function alphaSort(x, y, attr) {
        if (x[attr] < y[attr]) return -1
        if (x[attr] > y[attr]) return 1
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

        const children = devicesInDeviceGroup.map(x => getDeviceData(x))
        
        const groupData = [...children].sort((a,b) => {
            for (var i of sortArr) if (alphaSort(a, b, i) != 0) return alphaSort(a, b, i)
            return 0
        }).reverse()[0]

        groupArr.push({
            name: deviceGroup.name,
            key: deviceGroup.groupKey.replace(/ /g,'-'),
            children: children,
            type: groupData.type,
            released: groupData.released,
            hash: deviceGroup.hash,
            hideChildren: deviceGroup.hideChildren
        })
    }

    const ungroupedDevices = osDevMap
    .filter(x => !groupArr.map(y => y.children).flat().map(x => x.key).includes(x))
    .map(x => getDeviceData(x))
    
    return groupArr.concat(ungroupedDevices).sort((a,b) => {
        for (var i of sortArr) if (alphaSort(a, b, i) != 0) return alphaSort(a, b, i)
        return 0
    }).reverse()
}

function getDevicePageData(os) {
    const deviceList = getDeviceList(os)

    function getListEntry(dev, identifier) {
        let urlStart = identifier ? '/device/identifier/' : '/device/'

        let retObj = {
            text: dev.name,
            link: urlStart + require('../docs/.vuepress/plugins/writeTemp/lib/formatDeviceName')(dev.key)
        }

        if (dev.hoverLink) retObj.hoverLink = dev.hoverLink
        return retObj
    }
    
    return deviceList.map(x => {
        let retObj
        if (x.children) {
            retObj = getListEntry(x, false)
            if (!x.hideChildren) retObj.children = x.children.map(y => getListEntry(y, true))
        } else retObj = getListEntry(x, true)
        return retObj
    })
}

function getJailbreakPageData(os) {
    const osJailbreakArr = getOsJailbreakArr(os.uniqueBuild)
    const jbDevArr = getJbDevArr(osJailbreakArr, os)

    let combinedJbArr = osJailbreakArr.map((x,index) => {
        x.osDeviceMap = Array.from(new Set(jbDevArr[index].flat()))
        return x
    })

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

for (const os of osArr) {
    let obj = {
        title: {
            header: [os.osStr,os.version].join(' '),
            subtitle: {
                text: getReleaseDate(os.released) + (os.build ? ` — <code style="background: none; padding-inline: 2px; font-size: 1em;">${os.build}</code>` : ''),
                tags: [
                    {
                        text: 'Stable',
                        colour: '#039be5',
                        active: !os.beta && !os.rc
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
            }
        },
        sections: [
            {
                title: 'Jailbreaks',
                type: 'list',
                class: 'noListDisc customListDisc',
                content: getJailbreakPageData(os)
            },
            {
                title: 'Devices',
                type: 'list',
                class: 'noListDisc customListDisc',
                content: getDevicePageData(os)
            },
        ].filter(x => x.content.length > 0)
    }

    fs.writeFile(`./docs/.vuepress/public/pageData/firmware/${os.osStr.replace(/ /g,'-')};${os.uniqueBuild}.json`, JSON.stringify(obj), function (err) { if (err) throw err})
}