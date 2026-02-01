const deviceList = require('../../../../../grabData/deviceList')
const deviceGroups = require('../../../../../grabData/deviceGroups')

var pageList = []

pageList.push({
    path: '/device-list.html',
    frontmatter: {
        title: 'Device List',
        description: 'AppleDB device list',
        chartType: 'deviceList',
        deviceList: deviceList,
        sidebar: false,
        editLink: false,
        lastUpdated: false,
        contributors: false,
    }
})

pageList.push({
    path: '/aarons-special-device-list.html',
    frontmatter: {
        title: "Aaron's Special Device List",
        description: "Aaron's Special Device List",
        chartType: 'aaronsSpecialDeviceList',
        deviceList: deviceList,
        sidebar: false,
        editLink: false,
        lastUpdated: false,
        contributors: false,
    }
})
  
pageList.push({
    path: '/device-selection',
    frontmatter: {
        title: 'Device Selection',
        description: 'AppleDB device selection',
        chartType: 'deviceGroupList',
        redirect_from: ['/devices','/devices.html','/device','/device.html','/device-selection.html'],
        groupList: deviceGroups,
        sidebar: false,
        editLink: false,
        lastUpdated: false,
        contributors: false,
    }
})

let customTypeArr = {
    iPads: {
        typeArr: ['iPad', 'iPad Pro', 'iPad mini', 'iPad Air'],
        subtitle: ['Please select what model of iPad you have below.']
    },
    Macs: {
        typeArr: ['MacBook', 'MacBook Air', 'MacBook Pro', 'iMac', 'Mac mini', 'Mac Studio', 'Mac Pro', 'Xserve'],
        subtitle: ['Please select what model of Mac you have below.']
    },
    iPods: {
        typeArr: ['iPod touch', 'iPod nano', 'iPod shuffle', 'iPod mini', 'iPod'],
        subtitle: ['Please select what model of iPod you have below.']
    }
}

new Array([...new Set(deviceGroups.map(x => x.type)), ...Object.keys(customTypeArr)])[0].map(function(t) {
    let typeArr = [t]
    let subtitle
    if (customTypeArr[t]) {
        typeArr = customTypeArr[t].typeArr
        subtitle = customTypeArr[t].subtitle
    }

    const urlPart = require('../../writeTemp/lib/formatDeviceName')(t)
    const url = `/device-selection/${urlPart}.html`
    pageList.push({
        path: url,
        frontmatter: {
            title: `Device Selection (${t})`,
            description: 'AppleDB device selection',
            subtitle: subtitle,
            chartType: 'deviceGroup',
            widePage: false,
            type: t,
            group: deviceGroups.filter(x => !x.hideFromDeviceList)
            .map(x => {
                const devArr = x.devices.map(y => deviceList[y])
                for (const dev of devArr) {
                    if (x.imageKey && x.imageKey != dev.img.key) continue
                    if (dev.img.key == 'logo') continue
                    x.img = dev.img
                    break
                }

                if (!x.img) x.img = devArr[0].img
        
                const released = Array.from(new Set(devArr.map(y => y.released))).flat().sort((a,b) => {
                    if (new Date(a.released) < new Date(b.released)) return -1
                    if (new Date(a.released) > new Date(b.released)) return 1
                    return 0
                }).filter(x => x)
                if (released.join() != '') x.releasedStr = released.map(y => {
                    const dateOffset = (new Date().getTimezoneOffset() * 60 * 1000) + (60 * 60000)
                    const currentDate = new Date(y).valueOf()
                    const adjustedDate = new Date(currentDate + dateOffset)

                    const releasedArr = y.split('-')
                    const dateStyleArr = [{ year: 'numeric' }, { year: 'numeric', month: 'short' }, { dateStyle: 'medium' }]
                    return new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(adjustedDate)
                })
        
                const model = Array.from(new Set(devArr.map(y => y.model).flat()))
                if (model.join() != '') x.model = model
        
                const board = Array.from(new Set(devArr.map(y => y.board).flat()))
                if (board.join() != '') x.board = board
        
                const identifier = Array.from(new Set(devArr.map(y => (y.identifier != y.name) ? y.identifier : undefined).flat()))
                if (identifier.join() != '') x.identifier = identifier
        
                x.key = Array.from(new Set(devArr.map(y => y.key).flat()))
        
                return x
            }).filter(x => typeArr.includes(x.type)).sort((a,b) => {
                if (a.released < b.released) return 1
                if (a.released > b.released) return -1
                return 0
            }),
            sidebar: false,
            editLink: false,
            lastUpdated: false,
            contributors: false,
        }
    })
})

module.exports = pageList