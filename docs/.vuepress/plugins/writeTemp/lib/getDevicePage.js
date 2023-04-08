const iosList = require('../../../../../grabData/ios')
const jbList = require('../../../../../grabData/jailbreak')

const hasJbArr = [
    'iOS',
    'tvOS',
    'audioOS',
    'watchOS',
    'iPhoneOS',
    'iPadOS',
    'Apple TV Software',
    'bridgeOS'
]

function getFilteredDownloads(dlArr) {
    const retArr = dlArr
    const urlCount = Array.from(new Set(retArr.map(x => x.url))).length

    if (urlCount == 1) return [retArr[0]]
    else return retArr
}

module.exports = function(args) {
    if (!Array.isArray(args.devArr)) args.devArr = [args.devArr]
    const devArr = args.devArr
    const name = args.name
    const devPath = encodeURI(args.path)
    const description = args.description
    const grouped = args.grouped
    const mainList = args.mainList
    const hideChildren = args.hideChildren
    
    let devFwArr = iosList
    if (!mainList) devFwArr = devFwArr.filter(i => {
        const fwDevArr = Object.keys(i.deviceMap)
        const devIdArr = devArr.map(x => x.key)
        for (const id of devIdArr) if (fwDevArr.includes(id)) return true
        return false
    })

    const devFwVersionArr = devFwArr.map(x => [x.osStr,x.version].join(' '))
    const duplicateVersionArr = devFwVersionArr.filter((fw, index) => index !== devFwVersionArr.indexOf(fw))

    const mergingDeviceTypes = [
        {
            label: "iPhone, iPod touch",
            types: [
                "iPhone",
                "iPod touch"
            ]
        },
        {
            label: "iPad",
            types: [
                "iPad",
                "iPad Air",
                "iPad mini",
                "iPad Pro"
            ]
        },
        {
            label: "AirPods, Beats",
            types: [
                "AirPods",
                "Beats Headphones",
                "Beats Speakers",
                "Beats Earbuds"
            ]
        },
        {
            label: "Mac",
            types: [
                "MacBook",
                "MacBook Air",
                "MacBook Pro",
                "iMac",
                "iMac Pro",
                "Mac Pro",
                "Mac mini",
                "Mac Studio",
                "Developer Transition Kit",
                "Virtual Machine"
            ]
        }
    ]

    const pluralise = [
        "Display",
        "Keyboard",
        "Remote"
    ]

    function getDevType(type) {
        for (const devType of mergingDeviceTypes) if (devType.types.includes(type)) return devType.label
        if (pluralise.includes(type)) return type + 's'
        return type
    }

    function getDlArr(propertyName, fw) {
        let retArr = Object.keys(fw.deviceMap)
            .filter(x => devArr.map(x => x.key).includes(x))
            .map(x => {
                if (!fw.deviceMap[x] || !fw.deviceMap[x][propertyName]) return undefined
                const url = fw.deviceMap[x][propertyName].url
                if (!url) return undefined
                return {
                    deviceName: devArr.filter(y => y.key == x)[0].name,
                    key: x,
                    label: url.split('/')[url.split('/').length-1],
                    url: url
                }
            }
        ).filter(x => x)

        urlCount = Array.from(new Set(retArr.map(x => x.url))).length
        if (urlCount == 1) retArr = [retArr[0]]
        
        return retArr
    }

    let getVersionArr = devFwArr.map(i => {
        const dlArr = getDlArr('ipsw',i)
        const otaArr = getDlArr('ota',i)

        const devIdFwArr = Object.keys(i.deviceMap).filter(x => devArr.map(x => x.key).includes(x))
        const devTypeArr = Array.from(
            new Set(
                devIdFwArr.map(x => devArr.filter(y => y.key == x)[0])
                        .map(x => x.type)
                        .map(x => getDevType(x))
            )
        )

        let released
        if (!i.released) released = undefined
        else {
            const dateOffset = new Date().getTimezoneOffset() * 60 * 1000
            const currentDate = new Date(i.released).valueOf()
            const adjustedDate = new Date(currentDate + dateOffset)

            const releasedArr = i.released.split('-')
            const dateStyleArr = [{ year: 'numeric' }, { year: 'numeric', month: 'short' }, { dateStyle: 'medium' }]
            released = new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(adjustedDate)
        }

        let jbArr = []
        if (hasJbArr.includes(i.osStr)) jbArr = Array.from(
            new Set(
                devArr.map(d => jbList.filter(jb => {
                    if (!jb.compatibility) return false
                    const compat = jb.compatibility.map(x => x.firmwares.includes(i.build) && x.devices.includes(d.key))
                    return compat.filter(x => x).length > 0
                }))
            .flat()
            .map(x => x ? x.name : x)
            )
        ).filter(x => x)

        return {
            osStr: i.osStr,
            version: i.version,
            build: i.build,
            uniqueBuild: i.uniqueBuild,
            duplicateVersion: duplicateVersionArr.includes([i.osStr,i.version].join(' ')),
            url: `/firmware/${i.osStr.replace(/ /g,'-')}/${i.uniqueBuild}.html`,
            released: i.released,
            preinstalled: Array.isArray(i.preinstalled) ? i.preinstalled : i.preinstalled ? devIdFwArr : [],
            beta: i.beta,
            internal: i.internal,
            rc: i.rc,
            rsr: i.rsr,
            sdk: i.sdk,
            releasedStr: released,
            devices: devIdFwArr,
            deviceFilterArr: (mainList) ?
                devTypeArr :
                devIdFwArr,
            jailbreakArr: jbArr,
            downloads: dlArr,
            filteredDownloads: getFilteredDownloads(dlArr),
            otas: otaArr,
            filteredOtas: getFilteredDownloads(otaArr)
        }
    })

    const osStr = Array.from(new Set(getVersionArr.map(x => x.osStr)))

    const head = (mainList) ? [] : [
        [
        "meta",
        {
            property: "og:image",
            content: `https://img.appledb.dev/device@256/${devArr[0].key}/0.png`
        }
        ]
    ]

    const propertyArr = ['name','identifier','key','released','soc','arch','model','board','type']
    const infoArr = devArr.map(x => {
        var o = {}
        for (const p of propertyArr) if (x[p]) o[p] = x[p]
        return o
    })

    /*var extraInfo = undefined
    if (!mainList && devArr.map(x => x.info).filter(x => x).length > 0) {
        let extraInfoObj = {}
        for (const i of devArr) extraInfoObj[i.identifier] = i.info

        extraInfo = []
        for (const dev in extraInfoObj)
        if (extraInfoObj[dev])
        for (const i of extraInfoObj[dev]) {
            if (!extraInfo.map(x => x.type).includes(i.type)) {
                let retObj = {}
                for (p in i) retObj[p] = p == 'type' ? i[p] : [i[p]] 
                extraInfo.push(retObj)
            } else {
                let retObj = extraInfo.filter(x => x.type == i.type)[0]
                let properties = Array.from(new Set(Object.keys(i).concat(Object.keys(retObj)).filter(x => x != 'type')))
                for (p of properties) {
                    if (!retObj.hasOwnProperty(p)) retObj[p] = [i[p]]
                    else if (!retObj[p].map(x => JSON.stringify(x)).includes(JSON.stringify(i[p]))) retObj[p].push(i[p])
                }
            }
        }
    }*/
    var extraInfo = undefined
    if (!mainList && devArr.map(x => x.info).filter(x => x).length > 0) {
        extraInfo = {}
        for (const i of devArr) extraInfo[i.key] = i.info
    }

    const img = {
        count: devArr[0].imgCount,
        dark: devArr[0].imgDark,
        key: devArr[0].key
    }

    var imgCount = 0
    try {
        imgCount = fs.readdirSync(`docs/.vuepress/public/assets/images/device@256/${devArr[0].key}/`).length
    } catch {
        imgCount = 0
    }

    getVersionArr = getVersionArr.reverse().sort((a,b) => {
        const time = [a,b].map(x => x.released ? new Date(x.released).getTime() : 0)
        if (time[0] < time[1]) return 1
        if (time[0] > time[1]) return -1
        const osStr = [a,b].map(x => x.osStr.toLowerCase())
        if (osStr[0] < osStr[1]) return -1
        if (osStr[0] > osStr[1]) return 1
        return 0
    })

    const hasFirmwares = {
        release: getVersionArr.filter(x => !x.beta).length > 0,
        beta: getVersionArr.filter(x => x.beta).length > 0,
        internal: getVersionArr.filter(x => x.internal).length > 0
    }

    return {
        path: devPath,
        noAds: true,
        frontmatter: {
            title: name,
            hideTitle: !mainList,
            description: description || `Information lookup for ${name}`,
            chartType: 'device',
            widePage: false,
            device: infoArr,
            versionArr: getVersionArr.sort((a,b) => {
                if (mainList) return 0
                const compare = [a,b].map(x => x.devices.every(r => x.preinstalled.includes(r)))
                if (compare[0] < compare[1]) return -1
                if (compare[0] > compare[1]) return 1
                return 0
            }),
            hasFirmwares: hasFirmwares,
            hasFirmwareFilters: Object.keys(hasFirmwares).map(x => hasFirmwares[x]).reduce((a,b) => a + b) > 1,
            grouped: grouped,
            hideChildren: hideChildren,
            imgCount: imgCount,
            mainList: mainList,
            noJb: (!(osStr.some(r => hasJbArr.includes(r))) && !mainList),
            jbCount: getVersionArr.map(x => x.jailbreakArr).flat().length,
            img: img,
            extraInfo: extraInfo || undefined,
            deviceFilter: (mainList) ? 
                Array.from(new Set(devArr.map(x => getDevType(x.type)))).sort((a, b) => a.localeCompare(b)).map(x => {
                    return {
                        label: x,
                        value: x
                    }
                }) :
                devArr.map(x => {
                    return {
                        label: x.name,
                        value: x.key
                    }
                }),

            head: head,

            sidebar: false,
            editLink: false,
            lastUpdated: false,
            contributors: false
        }
    }
}