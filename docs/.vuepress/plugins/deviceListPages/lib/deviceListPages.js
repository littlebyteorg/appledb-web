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
  
Array.from(new Set(deviceGroups.map(x => x.type))).map(function(t) {
    const urlPart = require('../../writeTemp/lib/formatDeviceName')(t)
    const url = `/device-selection/${urlPart}.html`
    pageList.push({
        path: url,
        frontmatter: {
            title: `Device Selection (${t})`,
            description: 'AppleDB device selection',
            chartType: 'deviceGroup',
            widePage: true,
            type: t,
            group: deviceGroups.map(x => {
            const devArr = x.devices.map(y => deviceList[y])
            
            x.img = {
                count: devArr[0].imgCount,
                dark: devArr[0].imgDark
            }
    
            const released = Array.from(new Set(devArr.map(y => y.released))).flat().sort((a,b) => {
                if (new Date(a.released) < new Date(b.released)) return -1
                if (new Date(a.released) > new Date(b.released)) return 1
                return 0
            }).filter(x => x)
            if (released.join() != '') x.released = released.map(y => {
                const releasedArr = y.split('-')
                const dateStyleArr = [{ year: 'numeric'}, { dateStyle: 'medium'}, { dateStyle: 'medium'}]
                return new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(new Date(y))
            })
    
            const model = Array.from(new Set(devArr.map(y => y.model).flat()))
            if (model.join() != '') x.model = model
    
            const board = Array.from(new Set(devArr.map(y => y.board).flat()))
            if (board.join() != '') x.board = board
    
            const identifier = Array.from(new Set(devArr.map(y => (y.identifier != y.name) ? y.identifier : undefined).flat()))
            if (identifier.join() != '') x.identifier = identifier
    
            x.key = Array.from(new Set(devArr.map(y => y.key).flat()))
    
            return x
            })
            .filter(x => x.type == t),
            sidebar: false,
            editLink: false,
            lastUpdated: false,
            contributors: false,
        }
    })
})

module.exports = pageList