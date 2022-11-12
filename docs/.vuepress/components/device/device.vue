<template>
    <template v-if="!fm.mainList">
        <deviceInfo :infoArr="infoArr" :options="options" :img="{
            count: fm.img.count,
            dark: fm.img.dark,
            key: fm.device.map(x => x.key)[0]
        }"/>

        <deviceTabs :extraInfo="fm.extraInfo" :device="fm.device"/>

        <template v-if="!fm.hideChildren && groupedOrRelatedDevicesObj.devices.length > 1">
            <h2>{{ groupedOrRelatedDevicesObj.header }}</h2>
            <div class="groupedOrRelatedDevicesWrapper"><groupedOrRelatedDevice v-for="dev in groupedOrRelatedDevicesObj.devices" :key="dev.url" :device="dev"/></div>
        </template>
    </template>

    <template v-if="fm.versionArr && fm.versionArr.length > 0">
        <h2 v-if="!fm.mainList" style="margin-bottom: .3em;">
            {{ versionHeaderStr }}
            <i
                v-if="!fm.hasFirmwareFilters"
                class="fas fa-sort"
                style="
                    margin-left: 5px;
                    margin-bottom: .6em;
                    font-size: .7em;
                    cursor: pointer;
                " v-on:click="versionArr.reverse()"
            ></i>
        </h2>
        
        <div class="optionsWrapper" style="margin-bottom: .3em;" v-if="fm.hasFirmwareFilters">
            <div
                :class="[options.showStable ? 'active' : '', 'stable']"
                v-on:click="options.showStable = !options.showStable; filterVersions()"
                v-if="fm.hasFirmwares.stable"
            >
                <i class="fas fa-circle stable"></i> Stable
            </div>
            <div
                :class="[options.showBeta ? 'active' : '', 'beta']"
                v-on:click="options.showBeta = !options.showBeta; filterVersions()"
                v-if="fm.hasFirmwares.beta"
            >
                <i class="fas fa-circle beta"></i> Beta
            </div>
            <div
                :class="[options.showInternal ? 'active' : '', 'internal']"
                v-on:click="options.showInternal = !options.showInternal; filterVersions()"
                v-if="fm.hasFirmwares.internal"
            >
                <i class="fas fa-circle internal"></i> Internal
            </div>
            <div
                v-on:click="versionArr.reverse()"
                style="margin-left: auto;"
            >
                <i class="fas fa-sort"></i> Sort
            </div>
        </div>
        
        <!--<deviceFilter v-if="fm.mainList" :filterOptions="fm.deviceFilter" :options="options"/>-->

        <firmwareVersionTableElement
            v-for="fw in versionArr.slice(loadedFirmwares[0], loadedFirmwares[1])"
            :key="fw"
            :fw="fw"
            :options="options"
            :showSingleDownloads="versionArr.map(x => x.filteredDownloads || x.filteredOtas).filter(x => x.length).length > 0"
        />

        <template v-if="loadedFirmwares[1] < versionArr.length">
            <div style="display: flex; padding: 1em; padding-top: 1.5em;">
                <div>Displaying {{ loadedFirmwares[1] }} firmwares out of {{ versionArr.length }}.</div>
                <div style="margin-left: auto;"><a style="cursor: pointer;" v-on:click="loadedFirmwares[1] += 500">Load more</a></div>
            </div>
        </template>
    </template>

    <p v-on:click="devOptions = true">AppleDB is not affiliated with Apple Inc.</p>

    <hiddenOptions
        :options="options"
        :optionsObj="optionsObj"
        :showDevOptions="devOptions"
        :deviceFilter="fm.deviceFilter"
        :filterVersions="filterVersions"
    />
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'

String.prototype.format = function(vars) {
  let temp = this
  for (let item in vars)
    temp = temp.replace("${" + item + "}", vars[item])
  return temp
}

function formatDeviceName(n) {
  return n
  .replace(/ /g, '-')
  .replace(/\//g,'%2F')
  .replace(/ü/g,'u')
  .replace(/²/g,'2')
  .replace(/³/g,'3')
}

export default {
    data() {
        return {
            loadedFirmwares: [0,100],

            infoStrArr: [
                "Identifier: ${identifier}",
                "Released: ${released}",
                "SoC: ${soc}",
                "Arch: ${arch}",
                "Model: ${model}",
                "Board: ${board}"
            ],

            groupedHeaderStr: 'Grouped Devices',
            relatedHeaderStr: 'Related Devices',

            versionHeaderStr: 'Firmware Versions',
            tableHeadObj: {
                build: "Build",
                version: "Version",
                jailbreak: "Jailbreak",
                download: "Download",
                ota: "OTA Download",
                released: "Released"
            },
            optionsStr: 'Options',
            sortStr: 'Sort',
            deviceStr: 'Device',
            allDeviceStr: 'Filter',
            naStr: 'N/A',
            unknownDateStr: 'Unknown',
            viewAllStr: 'View all',

            activeTab: '',

            optionsObjStr: {
                showBuildNumber: "Show build numbers",
                showVersionString: "Show version numbers",
                showReleasedString: "Show release dates",
                showSigningStatus: "Show signing status"
            },

            imgCount: 0,
            maxImgCount: 0,

            options: {
                showBuildNumber: false,
                showVersionString: true,
                showReleasedString: true,
                showSigningStatus: true,

                showStable: true,
                showBeta: false,
                showInternal: false,
                
                filterDev: [],
                showAll: {}
            },
            
            reverseSorting: false,
            devOptions: false,
            versionArr: [],

            devicePath: '/device',
            fm: usePageFrontmatter(),
        }
    },
    computed: {
        infoArr() {
            const dev = this.fm.device
            function grabInfo(property) {
                if (property == 'released') {
                    const dateArr = Array.from(new Set(dev.map(x => x[property]).flat())).filter(x => x).sort().map(x => {
                        const dateOffset = new Date().getTimezoneOffset() * 60 * 1000
                        const currentDate = new Date(x).valueOf()
                        const adjustedDate = new Date(currentDate + dateOffset)

                        const releasedArr = x.split('-')
                        const dateStyleArr = [{ year: 'numeric'}, { dateStyle: 'medium'}, { dateStyle: 'medium'}]
                        const date = new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(adjustedDate)
                        
                        return date
                    })
                    return dateArr
                }

                return Array.from(new Set(dev.map(x => x[property]).flat())).sort()
            }
            const propertyArr = [
                'identifier',
                'released',
                'soc',
                'arch',
                'model',
                'board'
            ]
            var retObj = {}
            for (var str of this.infoStrArr) {
                const property = propertyArr.filter(x => str.includes(x))[0]

                const infoArr = grabInfo(property).filter(x => x)
                let info = infoArr
                if (property == 'released' && info.length > 1) info = info.map(x => x.replace(',',''))
                info = info.join(', ')

                if (property == 'identifier' && infoArr.includes(this.fm.title)) info = 'N/A'
                if (info) retObj[property] = str.format({ [property]: info })
            }
            return retObj
        },
        groupedOrRelatedDevicesObj() {
            const dev = this.fm.device
            return {
                header: (this.fm.grouped) ? this.groupedHeaderStr : this.relatedHeaderStr,
                devices: this.fm.device.map(x => {
                    return {
                        name: x.name,
                        identifier: x.identifier,
                        key: x.key,
                        released: x.released,
                        imgCount: this.fm.img.count,
                        imgDark: this.fm.img.dark,
                        url: [
                            this.devicePath,
                            'identifier',
                            x.key.replace(/ /g,'-')
                        ].join('/') + '.html'
                    }
                })
            }
        },
        optionsObj() {
            return [
                "showBuildNumber",
                "showVersionString",
                "showReleasedString",
                "showSigningStatus"
            ].map(x => {
                return {
                    label: this.optionsObjStr[x],
                    model: x,
                    display: true
                }
            })
        },
        tableHeaders() {
            return [
                {
                    label: this.tableHeadObj.build,
                    value: this.options.showBuildNumber
                }
            ].filter(x => x.value).map(x => x.label)
        }
    },
    methods: {
        checkScroll: function() {
            const loadRows = this.loadedFirmwares[1] - this.loadedFirmwares[0]
            
            if (this.versionArr.length >= loadRows) window.addEventListener("scroll", (event) => {
                const pageElement = document.getElementsByClassName('home')[0] || document.getElementsByClassName('theme-default-content')[0]

                let scroll = window.scrollY
                let pageHeight = pageElement.clientHeight
                let tableHeight = document.getElementsByClassName('firmwareVersionTableElement')[0].clientHeight
                
                if (scroll >= pageHeight - (tableHeight * loadRows) && this.loadedFirmwares[1] <= this.versionArr.length + loadRows) {
                    this.loadedFirmwares[1] += loadRows
                    if (this.loadedFirmwares[1] - this.loadedFirmwares[0] > loadRows * 4) {
                        this.loadedFirmwares[0] += loadRows
                        window.scrollBy(0, -tableHeight * loadRows)
                    }
                }
                if (scroll < (tableHeight * loadRows) && this.loadedFirmwares[0] >= loadRows) {
                    this.loadedFirmwares[0] -= loadRows
                    if (this.loadedFirmwares[1] - this.loadedFirmwares[0] > loadRows * 4) {
                        this.loadedFirmwares[1] -= loadRows
                        window.scrollBy(0, tableHeight * loadRows)
                    }
                }
            })
        },
        validateJSON(text) {
            if (typeof text !== "string") {
                return false;
            }
            try {
                JSON.parse(text);
                return true;
            } catch (error) {
                return false;
            }
        },
        getFilteredDownloads(dlArr) {
            const filterDev = this.options.filterDev
            const fmDeviceFilter = this.fm.deviceFilter
            if (
                JSON.stringify(filterDev) == JSON.stringify(fmDeviceFilter[0].value) ||
                this.fm.mainList
            ) return dlArr
            
            const retArr = dlArr.filter(x => filterDev.includes(x.key))
            const urlCount = Array.from(new Set(retArr.map(x => x.url))).length

            if (urlCount == 1) return [retArr[0]]
            else return retArr
        },
        filterVersions() {
            this.versionArr = this.fm.versionArr.filter(fw =>
                (fw.beta ? this.options.showBeta : this.options.showStable) &&
                (fw.internal ? this.options.showInternal : true) &&
                fw.deviceFilterArr.some(r => this.options.filterDev.includes(r))
            )
        }
    },
    mounted() {
        const noJailbreaks = this.fm.noJb || this.fm.jbCount < 1

        this.options.filterDev = this.fm.deviceFilter.map(x => x.value)

        if (this.fm.mainList) {
            this.options.showBeta = true
            this.options.showInternal = true
        }

        this.filterVersions()

        this.maxImgCount = this.fm.imgCount
    },
    watch: {
        imgCount(val) {
            if (val > this.maxImgCount - 1) this.imgCount = 0
        }
    }
}
</script>

<style lang="scss" scoped>
html.dark .optionsWrapper div {
    background: var(--c-border-dark);
}

.optionsWrapper {
    display: flex;
    align-content: space-between;
    flex-wrap: wrap;

    .active {
        background: var(--c-border);
        font-weight: 600;

        &.stable {
            background: #039be530 !important;
            border-color: #039be501;
        }

        &.beta {
            background: #ab47bc30 !important;
            border-color: #ab47bc01;
        }

        &.internal {
            background: #fbc02d30 !important;
            border-color: #fbc02d01;
        }
    }

    div {
        padding: .7em;
        padding-inline: 1.2em;
        margin: .3em;
        border-radius: 4em;
        cursor: pointer;
        transition: 100ms background ease-in-out, transform 150ms ease-in-out;
        //border: 1px solid var(--c-border);
        box-shadow: 0px 2px 9px rgba(0,0,0,0.1);
        
        &.stable {
            background: #039be510 !important;
            &:hover {
                background: #039be530 !important;
            }
        }
        &.beta {
            background: #ab47bc10 !important;
            &:hover {
                background: #ab47bc30 !important;
            }
        }
        &.internal {
            background: #fbc02d10 !important;
            &:hover {
                background: #fbc02d30 !important;
            }
        }

        &:hover {
            transform: scale(1.05);
            background: var(--c-border) !important;
        }

        .fa-circle {
            font-size: .5em;
            vertical-align: middle;
            padding-bottom: 2px;
            padding-right: 4px;
        }

        .stable {
            color: #039be5;
        }

        .beta {
            color: #ab47bc;
        }

        .internal {
            color: #fbc02d;
        }
    }
}

.groupedOrRelatedDevicesWrapper {
    display: grid;
        grid-template-columns: 50% 50%;
}

@media screen and (max-width: 575px) {
    .groupedOrRelatedDevicesWrapper {
        grid-template-columns: 100%;
    }
}
</style>