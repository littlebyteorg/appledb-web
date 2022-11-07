<template>
    <template v-if="!fm.mainList">
        <div class="flexWrapper" :style="(wrapImg) ? 'flex-direction: column;' : 'flex-direction: row;'">
            <ul class="infoList" id="flexInfo">
                <li v-for="(s, index) in infoArr" :key="s">
                    <template v-if="(infoArr[index].split(', ').length > 5 && !options.showAll[index])">
                        {{ s.replace(infoArr[index], infoArr[index].split(', ').slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="options.showAll[index] = true">...</a>
                    </template>
                    <template v-else v-once>{{ s }}</template>
                </li>
            </ul>
            <div v-if="fm.img.count && fm.img.count > 0" :style="`padding-top: ${wrapImg ? '1em' : '0'};`" class="devFlexImgWrapper">
                <template
                    v-for="i in Math.min(fm.img.count,3)"
                    :key="i"
                >
                    <picture
                        v-for="url in [`https://img.appledb.dev/device@main/${fm.device.map(x => x.key)[0]}/${i-1}${isDarkMode && fm.img.dark ? '_dark' : ''}`]"
                        :key="url"
                    >
                        <source :srcset="url + '.avif'" type="image/avif">
                        <source :srcset="url + '.webp'" type="image/webp">
                        <img
                            :src="url + '.png'"
                            :class="`flexImg flexImg${i}`"
                            style="margin-left: .5em; max-height: 8em;"
                        >
                    </picture>
                </template>
            </div>
        </div>

        <div class="tab-container">
            <section v-for="(tab,index) in tabArr" :key="tab">
                <input :id="tab" type="radio" :checked="activeTab == tab">
                <label :for="tab" class="tab-link" v-on:click="activeTab = tab">
                    {{ tab.formatExtraInfoTitle() }}
                </label>
                <div :class="`tab ${(index == tabArr.length - 1) ? 'tab-last' : ''}`" style="overflow-x: auto; padding: 0;">
                    <table style="margin: 0;">
                        <tr style="border: none;" v-if="Object.keys(fm.extraInfo).length > 1 && [Object.keys(tabData).map(x => tabData[x][tab])].map(d => Array.from(new Set(d.map(y => JSON.stringify(Object.keys(y).map(x => y[x]))))).length)[0] > 1"><th/><th v-for="dev in Object.keys(fm.extraInfo)" :key="dev">{{ fm.device.filter(x => x.key == dev)[0].name }}</th></tr>
                        <tr style="border: none;" v-for="property in tabPropertyArr[tab]" :key="property">
                            <td style="border: none;">{{ property.formatExtraInfoTitle() }}</td>
                            <td style="border: none;" v-if="Array.from(new Set(Object.keys(tabData).map(x => JSON.stringify(tabData[x][tab][property])))).length == 1 && Object.keys(tabData).map(x => JSON.stringify(tabData[x][tab][property])).length != 1" :colspan="Object.keys(fm.extraInfo).length">
                                {{ tabData[Object.keys(tabData)[0]][tab][property].formatExtraInfoText(property) }}
                            </td>
                            <td style="border: none;" v-else v-for="dev in tabData" :key="dev">
                                <template v-if="dev[tab][property]">
                                    {{ dev[tab][property].formatExtraInfoText(property) }}
                                </template>
                            </td>
                        </tr>
                    </table>
                </div>
            </section>
        </div>

        <template v-if="!fm.hideChildren && groupedOrRelatedDevicesObj.devices.length > 1">
            <h2>{{ groupedOrRelatedDevicesObj.header }}</h2>
            <div class="groupedOrRelatedDevicesWrapper"><groupedOrRelatedDevice v-for="dev in groupedOrRelatedDevicesObj.devices" :key="dev.url" :device="dev"/></div>
        </template>
    </template>

    <template v-if="fm.versionArr && fm.versionArr.length > 0">
        <h2 v-if="!fm.mainList" style="margin-bottom: .3em;">{{ versionHeaderStr }}</h2>

        <div><ul class="tableOptionsWrapper" >
            <li :style="`margin-right: 1.5em; ${(fm.deviceFilter.length > 2) ? 'padding-top: 0.15em;' : ''}`">
                <label class="chartDropdown">
                    <i class="fas fa-cog"></i>
                    {{ optionsStr }}
                    <span class="arrow down"></span>
                </label>
                <div class="chartDropdownBox">
                    <template v-for="(optionSection, index) in optionsObj.filter(x => x.filter(y => y.display).length > 0)" :key="optionSection">
                        <ul v-for="option in optionSection.filter(x => x.display)" :key="option"><li>
                            <input type="checkbox" v-model="options[option.model]" :id="option.id">
                            <label :for="option.id">{{ option.label }}</label>
                        </li></ul>
                        <template v-if="index < optionsObj.length - 1"><ul><li style="padding: 0;"></li></ul></template>
                    </template>
                </div>
            </li>
            <li :style="`margin-right: 1.5em; ${(fm.deviceFilter.length > 2) ? 'padding-top: 0.15em;' : ''}`">
                <label class="chartDropdown" v-on:click="versionArr.reverse()">
                    <i class="fas fa-sort"></i>
                    {{ sortStr }}
                </label>
            </li>
        </ul></div>

        <div><template v-for="filteredFirmwares in [
            versionArr.filter(fw =>
                fw.beta ? options.showBeta : options.showStable
            )
        ]">
        <firmwareVersionTableElement
            v-for="fw in filteredFirmwares"
            :key="fw"
            :fw="fw"
            :options="options"
            :showSingleDownloads="filteredFirmwares.map(x => x.filteredDownloads).filter(x => x.length == 1).length > 0"
        /></template></div>
    </template>

    <p>AppleDB is not affiliated with Apple Inc.</p>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'

String.prototype.format = function(vars) {
  let temp = this
  for (let item in vars)
    temp = temp.replace("${" + item + "}", vars[item])
  return temp
}

String.prototype.formatExtraInfoTitle = function() {
    /*function capitaliseFirstLetter(str) { return str.charAt(0).toUpperCase() + str.slice(1) }
    return this.split('_').map(x => capitaliseFirstLetter(x)).join(' ')*/
    return this.replace(/_/g, ' ')
}

Array.prototype.formatExtraInfoText = function(property) {
    let temp = this

    if (property == 'Resolution') temp = temp.map(x => x.x + ' x ' + x.y)

    return Array.from(new Set(temp.flat())).filter(x => x || x === false)/*.sort()*/.join(', ')
    .replace(/true/g, 'Yes')
    .replace(/false/g, 'No')
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
            loadedFirmwares: [0,25],

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

            versionHeaderStr: 'Version Table',
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
                showBuildColumn: "Show build numbers",
                showVersionColumn: "Show version numbers",
                showJailbreakColumn: "Show jailbreaks",
                showDownloadColumn: "Show download links",
                showOtaColumn: "Show OTA download links",
                showReleasedColumn: "Show release dates",
                showStable: "Show stable version",
                showBeta: 'Show beta versions'
            },

            imgCount: 0,
            maxImgCount: 0,

            options: {
                showBuildColumn: false,
                showVersionColumn: true,
                showJailbreakColumn: true,
                showDownloadColumn: false,
                showOtaColumn: false,
                showReleasedColumn: false,

                showStable: true,
                showBeta: false,
                
                filterDev: [],
                showAll: {}
            },
            
            wrapImg: false,
            reverseSorting: false,
            unslicedVersionArr: [],
            versionArr: [],

            devicePath: '/device',
            fm: usePageFrontmatter(),
            isDarkMode: useDarkMode()
        }
    },
    computed: {
        tabArr() {
            if (!this.fm.extraInfo) return []
            return Array.from(
                new Set(
                    Object.keys(this.fm.extraInfo)
                    .map(x => this.fm.extraInfo[x]).flat()
                    .map(x => x.type)
                )
            )
        },
        tabPropertyArr() {
            const arr = Object.keys(this.fm.extraInfo).map(x => this.fm.extraInfo[x]).flat()
            let retObj = {}
            for (const i of arr) {
                if (!retObj.hasOwnProperty(i.type)) retObj[i.type] = Object.keys(i).filter(x => x != 'type')
                else retObj[i.type].concat(Object.keys(i.type).filter(x => x != 'type'))
            }
            return retObj
        },
        tabData() {
            let retObj = {}
            for (const dev in this.fm.extraInfo) {
                retObj[dev] = {}
                for (const tab of this.fm.extraInfo[dev]) {
                    retObj[dev][tab.type] = {}
                    for (const property in tab) {
                        if (property == 'type') continue
                        retObj[dev][tab.type][property] = Array.isArray(tab[property]) ? tab[property] : [tab[property]]
                    }
                }
            }
            return retObj
        },
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
                [
                    "showStable",
                    "showBeta",
                ],
                [
                    "showBuildColumn"
                ]
            ].map(x => {
                return x.map(y => {
                    return {
                        label: this.optionsObjStr[y],
                        model: y,
                        id: y + 'Checkbox',
                        display: true
                    }
                })
            })
        },
        tableHeaders() {
            return [
                {
                    label: this.tableHeadObj.build,
                    value: this.options.showBuildColumn
                }
            ].filter(x => x.value).map(x => x.label)
        }
    },
    methods: {
        checkWrap: function() {
            const flexImgs = document.getElementsByClassName('flexImg')
            const flexInfoWidth = document.getElementById('flexInfo').getBoundingClientRect().width

            const element = document.getElementsByClassName('home')[0] || document.getElementsByClassName('theme-default-content')[0]
            var totalWidth = element.clientWidth - parseFloat(window.getComputedStyle(element).paddingLeft) - parseFloat(window.getComputedStyle(element).paddingRight)
            let flexImgWidth = 0

            const flexImgsLength = flexImgs.length
            let counter = 0

            for (let i = 0; i < flexImgsLength; i++) {
                flexImgs[i].onload = () => {
                    if (counter >= flexImgsLength) return
                    flexImgWidth += flexImgs[i].clientWidth
                    this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 10
                    counter++
                }
            }

            window.onresize = () => {
                totalWidth = totalWidth = element.clientWidth - parseFloat(window.getComputedStyle(element).paddingLeft) - parseFloat(window.getComputedStyle(element).paddingRight)
                this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 10
            }
        },
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
        }
    },
    mounted() {
        this.versionArr = this.fm.versionArr.sort((a,b) => {
            const time = [a,b].map(x => x.released ? new Date(x.released).getTime() : 0)
            if (time[0] < time[1]) return 1
            if (time[0] > time[1]) return -1
            const osStr = [a,b].map(x => x.osStr.toLowerCase())
            if (osStr[0] < osStr[1]) return -1
            if (osStr[0] > osStr[1]) return 1
            return 0
        }).sort((a,b) => {
            if (this.fm.mainList) return 0
            if (!a.preinstalled < !b.preinstalled) return 1
            if (!a.preinstalled === true > !b.preinstalled) return -1
            return 0
        })

        const noJailbreaks = this.fm.noJb || this.fm.jbCount < 1

        if (this.fm.mainList) {
            this.options.filterDev = this.fm.deviceFilter[0].value
            //this.options.showBeta = true
        }
        else {
            this.checkWrap()
            this.options.filterDev = this.fm.deviceFilter[0].value
        }

        if (this.tabArr.length > 0) this.activeTab = this.tabArr[0]

        this.maxImgCount = this.fm.imgCount
    },
    updated() {
        //if (this.versionArr.length > 200) this.checkScroll()
    },
    watch: {
        imgCount(val) {
            if (val > this.maxImgCount - 1) this.imgCount = 0
        }
    }
}
</script>

<style scoped>
.devFlexImgWrapper {
    overflow: hidden;
    user-select: none;
    text-align: center;
    padding-bottom: 1em;
    margin-bottom: 1em;
    max-height: 7em;
}

.flexImg0 {
    margin-left: 0 !important;
    max-width: 100%;
}

select {
  /* styling */
  background-color: inherit;
  border: thin solid var(--c-border-dark);
  border-radius: 8px;
  display: inline-block;
  font: inherit;
  line-height: 1em;
  font-size: .8em;
  padding: 0.8em 3.5em 0.8em 1em;

  /* reset */

  margin: 0;      
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;

  background-image:
    linear-gradient(45deg, transparent 50%, gray 50%),
    linear-gradient(135deg, gray 50%, transparent 50%),
    linear-gradient(to right, var(--c-border-dark), var(--c-border-dark));
  background-position:
    calc(100% - 18px) calc(1em + 2px),
    calc(100% - 13px) calc(1em + 2px),
    calc(100% - 2.5em) 0.55em;
  background-size:
    5px 5px,
    5px 5px,
    1px 1.5em;
  background-repeat: no-repeat;
}

select:focus {
  background-image:
    linear-gradient(45deg, var(--c-text-accent) 50%, transparent 50%),
    linear-gradient(135deg, transparent 50%, var(--c-text-accent) 50%),
    linear-gradient(to right, var(--c-text-accent), var(--c-text-accent));
  background-position:
    calc(100% - 13px) 1.1em,
    calc(100% - 18px) 1.1em,
    calc(100% - 2.5em) 0.55em;
  background-size:
    5px 5px,
    5px 5px,
    1px 1.5em;
  background-repeat: no-repeat;
  border-color: var(--c-text-accent);
  color: var(--c-text-accent) !important;
  outline: 0;
}

select:-moz-focusring {
  color: transparent;
  text-shadow: 0 0 0 #000;
}

.flexWrapper {
  display: flex;
  justify-content: space-between;
}

.flexWrapper img {
  align-self: center;
  margin-right: 0;
  margin-left: 0;
}

.infoList {
    list-style-type: none;
    padding-left: 0;
    margin-top: 0;
}

.showOnHover .hoverElement {
  opacity: 0;
  display: none !important;
}

.showOnHover .opaqueHoverElement {
  opacity: 0;
  display: none !important;
}

.showOnHover:hover .hoverElement {
  opacity: 0.3;
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 100ms;
  display: inline !important;
}

.showOnHover:hover .opaqueHoverElement {
  opacity: 1;
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 100ms;
  display: inline !important;
}

.hoverElement:hover {
  opacity: 1 !important;
  display: inline !important;
}

.chartDropdown {
  font-size: 0.9rem;
  line-height: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.chartDropdownBox {
  position: absolute;
  height: auto !important;
  box-sizing: border-box;
  background-color: var(--c-bg-navbar);
  border-bottom-color: var(--c-border-dark);
  text-align: left;
  border-radius: 0.25rem;
  white-space: nowrap;
  top: auto;
  user-select: none;
  border: 0px solid var(--c-border);

  padding: 0;
  max-height: 0px;
  transition: 300ms ease-in-out;
}

.chartDropdownBox input[type="checkbox"] {
  position: static;
  left: 0px;
  opacity: 1;
  margin-right: .5em;
}

.chartDropdown:hover + div.chartDropdownBox {
  left: auto;
  top: auto;
  padding: 1.5em 0.8em 1.5em 0em;
  /*border: 1px solid var(--c-border);*/
  box-shadow: 0px 1px 6px var(--dropdown-shadow);
  max-height: 100%;
  transition: 300ms ease-in-out;
}

.chartDropdownBox:hover {
  left: auto;
  top: auto;
  padding: 1.5em 0.8em 1.5em 0em;
  /*border: 1px solid var(--c-border);*/
  box-shadow: 0px 1px 6px var(--dropdown-shadow);
  max-height: 100%;
  transition: 300ms ease-in-out;
}

.chartDropdown:hover + div.chartDropdownBox li {
  opacity: 1;
  padding: 0em 1em;
  max-height: 100%;
}

.chartDropdownBox:hover li {
  opacity: 1;
  padding: 0em 1em;
  max-height: 100%;
}

.chartDropdownBox li {
  list-style-type: none;
  float: none !important;
  margin: 0 !important;

  overflow: hidden;
  padding: 0px;
  opacity: 0;
  max-height: 0px;
  transition: 300ms ease-in-out;
}

.tableOptionsWrapper li {
    display: inline;
    margin: 0em 1.5em .5em 0em;
}

.tableOptionsWrapper li {
  list-style-type: none;
}

.chartDropdown button {
  cursor: pointer;
  border: none;
  background-color: inherit;
  font-size: inherit;
  line-height: inherit;
  font-weight: inherit;
  font-family: inherit;
  color: inherit;
  padding: inherit;
}

td, th {
    text-align: center;
}

@media screen and (max-width: 575px) {
    .tab-container section .tab-link {
        width: 100%;
    }

    .tab-container section:last-of-type .tab-link  {
        border-bottom-width: 1px;
        border-radius: 0 0 0.25rem 0.25rem;
    }

    .tab-container section:first-of-type .tab-link {
        border-radius: 0.25rem 0.25rem 0 0 !important;
    }
}

@media screen and (max-width: 575px) {
    .tab-container .tab {
        border-radius: 0;
        border-bottom-width: 0;
        order: 0;
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