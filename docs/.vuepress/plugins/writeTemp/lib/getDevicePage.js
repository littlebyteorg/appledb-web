const iosList = require('../../../../../grabData/ios')
const jbList = require('../../../../../grabData/jailbreak')
const deviceFilterGroups = require('../../../../../appledb/appledb-web/deviceFilterGroups.json')

const hasJbArr = [
    'iOS',
    'tvOS',
    'HomePod Software',
    'watchOS',
    'iPhone Software',
    'iPhone OS',
    'iPadOS',
    'Apple TV Software',
    'bridgeOS'
]

function getFilteredDownloads(dlArr) {
    const retArr = dlArr
    const urlCount = Array.from(new Set(retArr)).length

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
    const show = args.show
    const subgroups = args.subgroups || []
    const osStrArr = args.osStrArr || []
    
    let devFwArr = iosList
    if (!mainList) devFwArr = devFwArr.filter(i => {
        const fwDevArr = Object.keys(i.deviceMap)
        const devIdArr = devArr.map(x => x.key)
        for (const id of devIdArr) if (fwDevArr.includes(id)) return true
        return false
    })

    if (osStrArr.length) devFwArr = devFwArr.filter(i => osStrArr.includes(i.osStr))

    const devFwVersionArr = devFwArr.map(x => [x.osStr,x.version].join(' '))
    const duplicateVersionArr = devFwVersionArr.filter((fw, index) => index !== devFwVersionArr.indexOf(fw))

    function getDevType(type) {
        for (const devType of deviceFilterGroups) if (devType.types.includes(type)) return devType.label
        return type
    }

    function getDlArr(propertyName, fw) {
        let retArr = Object.keys(fw.deviceMap)
            .filter(x => devArr.map(y => y.key).includes(x))
            .map(key => {
                if (!fw.sources) return

                let sources = fw.sources.filter(s => s.type == propertyName && s.deviceMap.includes(key))
                if (!sources.length) return

                let urlArray = sources[0].links.filter(x => x.active)
                if (!urlArray.length) return

                return {
                    deviceName: devArr.filter(y => y.key == key)[0].name,
                    key: key,
                    label: "Label",
                    url: urlArray[0].url
                }
            }
        ).filter(x => x)

        urlCount = Array.from(new Set(retArr)).length
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
            const dateOffset = (new Date().getTimezoneOffset() * 60 * 1000) + (60 * 60000)
            const currentDate = new Date(i.released).valueOf()
            const adjustedDate = new Date(currentDate + dateOffset)

            const releasedArr = i.released.split('-')
            const dateStyleArr = [{ year: 'numeric' }, { year: 'numeric', month: 'short' }, { dateStyle: 'medium' }]
            released = new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(adjustedDate)
        }

        let jbCompatibility = {}
        if (hasJbArr.includes(i.osStr)) jbList.forEach(jb => {
            if (!jb.compatibility) return;
            let compatibility = jb.compatibility.filter(x => x.firmwares.includes(i.build)).map(x => x.devices).flat(Infinity)
            compatibility = [...new Set(compatibility).intersection(new Set(devIdFwArr))]
            if (compatibility.length) jbCompatibility[jb.name] = compatibility
        })


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
            releasedStr: released,
            devices: devIdFwArr,
            deviceFilterArr: (mainList) ?
                devTypeArr :
                devIdFwArr,
            jailbreakCompatibility: jbCompatibility,
            downloads: dlArr,
            filteredDownloads: getFilteredDownloads(dlArr),
            otas: otaArr,
            filteredOtas: getFilteredDownloads(otaArr)
        }
    })

    const osStr = Array.from(new Set(getVersionArr.map(x => x.osStr)))
    const head = (mainList || !devArr[0].hasImage) ? [] : [
        [
        "meta",
        {
            property: "og:image",
            content: `https://img.appledb.dev/device@256/${devArr[0].imageKey}/${devArr[0].img.images[0].id}.png`
        }
        ]
    ]

    const propertyArr = ['name','identifier','appLink','key','released','soc','arch','model','board','type','colors','img']
    const linkableArr = ['appLink']
    const infoArr = devArr.map(x => {
        var o = {}
        for (const p of propertyArr)
            if (x[p])
                if (linkableArr.includes(p) && typeof x[p] === 'string')
                    o[p] = {
                        'url': x[p],
                        'active': true
                    }
                else o[p] = x[p]
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
    /*if (!mainList && devArr.map(x => x.info).filter(x => x).length > 0) {
        extraInfo = {}
        for (const i of devArr) extraInfo[i.key] = i.info
    }*/

    let img = devArr.filter(x => x.img && x.img.images && x.img.images.length)
    if (img.length) img = img[0].img
    else img = { key: 'logo', images: [{'id': 0, 'dark': true}] }

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
        release: getVersionArr.filter(x => !(x.beta || x.rc || x.internal)).length > 0,
        beta: getVersionArr.filter(x => x.beta || x.rc).length > 0,
        internal: getVersionArr.filter(x => x.internal).length > 0
    }

    const hasFirmwareFilters = Object.keys(hasFirmwares).map(x => hasFirmwares[x]).reduce((a,b) => a + b) > 1

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
            hasFirmwareFilters: hasFirmwareFilters,
            grouped: grouped,
            subgroups: subgroups.map(sg => {
                let devArr = infoArr.filter(d => sg.devices.includes(d.key))

                return {
                    name: sg.name,
                    identifier: devArr.map(x => x.identifier).flat().flat(),
                    subgroup: true,
                    key: sg.groupKey,
                    deviceKeys: sg.devices,
                    released: devArr[0].released,
                    soc: devArr[0].soc,
                    arch: devArr[0].arch,
                    model: devArr.map(x => x.model).flat().flat(),
                    board: devArr.map(x => x.board).flat().flat(),
                    type: sg.type,
                    colors: devArr.map(x => x.colors || []).flat().flat(),
                    img: devArr[0].img
                }
            }),
            hideChildren: hideChildren,
            imgCount: imgCount,
            mainList: mainList,
            show: show || {
                releaseType: hasFirmwareFilters ? [ 'release' ] : Object.keys(hasFirmwares).find(x => hasFirmwares[x])
            },
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
