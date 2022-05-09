<template>
    <template v-if="!fm.mainList">
        <div class="flexWrapper" :style="(wrapImg) ? 'flex-direction: column;' : 'flex-direction: row;'">
            <ul class="infoList" id="flexInfo">
                <li v-for="(s, index) in infoArr" :key="s">
                    <template v-if="(infoArr[index].split(', ').length > 5 && !options.showAll[index])">
                        {{ s.replace(infoArr[index], infoArr[index].split(', ').slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="options.showAll[index] = true">...</a>
                    </template>
                    <template v-else>{{ s }}</template>
                </li>
            </ul>
            <div v-if="fm.img.count && fm.img.count > 0" :style="`user-select: none; text-align: center; padding-top: ${wrapImg ? '1em' : '0'}; padding-bottom: 1em; height: 8em; overflow: hidden;`">
                <img v-for="i in Math.min(fm.img.count,3)" :key="i" :class="`flexImg flexImg${i}`" :src="`https://img.appledb.dev/device@main/${fm.device.map(x => x.identifier)[0].replace(/\//g,'%252F').replace(/ü/g,'u')}/${i-1}${isDarkMode && fm.img.dark ? '_dark' : ''}.png`" style="margin-left: .5em; height: 8em;">
            </div>
        </div>

        <div class="tab-container">
            <section v-for="(tab,index) in tabArr" :key="tab">
                <input :id="tab" type="radio" :checked="activeTab == tab">
                <label :for="tab" class="tab-link" v-on:click="activeTab = tab">
                    {{ tab.formatExtraInfoTitle() }}
                </label>
                <div :class="`tab ${(index == tabArr.length - 1) ? 'tab-last' : ''}`" style="overflow-x: scroll;">
                    <table style="margin: 0;">
                        <tr v-if="Object.keys(fm.extraInfo).length > 1 && [Object.keys(tabData).map(x => tabData[x][tab])].map(d => Array.from(new Set(d.map(y => JSON.stringify(Object.keys(y).map(x => y[x]))))).length)[0] > 1"><th/><th v-for="dev in Object.keys(fm.extraInfo)" :key="dev">{{ fm.device.filter(x => x.identifier == dev)[0].name }}</th></tr>
                        <tr v-for="property in tabPropertyArr[tab]" :key="property">
                            <td>{{ property.formatExtraInfoTitle() }}</td>
                            <td v-if="Array.from(new Set(Object.keys(tabData).map(x => JSON.stringify(tabData[x][tab][property])))).length == 1 && Object.keys(tabData).map(x => JSON.stringify(tabData[x][tab][property])).length != 1" :colspan="Object.keys(fm.extraInfo).length">
                                {{ tabData[Object.keys(tabData)[0]][tab][property].formatExtraInfoText(property) }}
                            </td>
                            <td v-else v-for="dev in tabData" :key="dev">
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
            <ul>
                <li v-for="dev in groupedOrRelatedDevicesObj.devices" :key="dev" class="showOnHover">
                    <router-link :to="dev.url">
                        {{ dev.name }}
                    </router-link>
                    <div v-if="dev.name != dev.identifier" style="padding-left: .5em;" class="hoverElement"><code>
                        {{ dev.identifier }}
                    </code></div>
                </li>
            </ul>
        </template>
    </template>

    <h2 v-if="fm.versionArr && fm.versionArr.length > 0 && !fm.mainList">{{ versionHeaderStr }}</h2>

    <template v-if="fm.versionArr && fm.versionArr.length > 0">

        <ul class="tableOptionsWrapper">
            <li :style="`margin-right: 1.5em; ${(fm.deviceFilter.length > 2) ? 'padding-top: 0.15em;' : ''}`">
                <label class="chartDropdown">
                    <i class="fas fa-cog"></i>
                    {{ optionsStr }}
                    <span class="arrow down"></span>
                </label>
                <div class="chartDropdownBox">
                    <template v-for="(optionSection, index) in optionsObj.filter(x => x.filter(y => y.display).length > 0)" :key="optionSection">
                        <ul>
                            <li v-for="option in optionSection.filter(x => x.display)" :key="option">
                                <input type="checkbox" v-model="options[option.model]" :id="option.id">
                                <label :for="option.id">{{ option.label }}</label>
                            </li>
                        </ul>
                        <template v-if="index < optionsObj.length - 1"><ul><li style="padding: 0;"><hr></li></ul></template>
                    </template>
                </div>
            </li>
            <li v-if="!fm.hideChildren && fm.deviceFilter.length > 2">
                <select v-model="options.filterDev" name="deviceSelect" id="deviceSelect" :style="`margin-left: .5em; ${(options.filterDev == fm.deviceFilter[0].value) ? 'color: gray;' : ''}`">
                    <option v-for="(filterItem, index) in fm.deviceFilter" :key="filterItem" :value="filterItem.value">
                        <template v-if="index == 0 && !fm.mainList" >{{ allDeviceStr }}</template>
                        <template v-else>{{ filterItem.label }}</template>
                    </option>
                </select>
            </li>
        </ul>

        <div class="tableContainer">
            <table>
                <tr>
                    <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
                </tr>
                <template v-for="fw in fm.versionArr.sort((a,b) => {
                    const time = [a,b].map(x => x.released ? new Date(x.released).getTime() : 0)
                    if (time[0] < time[1]) return 1
                    if (time[0] > time[1]) return -1
                    return 0
                })" :key="fw">
                    <tr v-if="
                        fw.beta ? options.showBeta : options.showStable &&
                        fm.mainList ? 
                            fw.deviceFilterArr.includes(options.filterDev) || options.filterDev == fm.deviceFilter[0].value :
                            fw.deviceFilterArr.some(r => options.filterDev.includes(r))
                    ">

                        <td v-if="options.showBuildColumn" class="showOnHover">
                            <router-link :to="fw.url">{{ fw.build }}</router-link>
                            <template v-if="getFilteredDownloads(fw.downloads).length == 1 && !options.showDownloadColumn">
                                <a v-for="dl in getFilteredDownloads(fw.downloads)" :key="dl" :href="dl.url">
                                    <i class="fas fa-download hoverElement" style="margin-left: .4em; position: absolute;"></i>
                                </a>
                            </template>
                        </td>
                        
                        <td v-if="options.showVersionColumn">
                            <template v-if="options.showBuildColumn">{{ fw.osStr }} {{ fw.version }}</template>
                            <div v-else class="showOnHover">
                                <router-link :to="fw.url">{{ fw.osStr }} {{ fw.version }}<template v-if="fw.duplicateVersion"> ({{ fw.build }})</template></router-link>
                                <template v-if="getFilteredDownloads(fw.downloads).length == 1 && !options.showDownloadColumn">
                                    <a v-for="dl in getFilteredDownloads(fw.downloads)" :key="dl" :href="dl.url">
                                        <i class="fas fa-download hoverElement" style="margin-left: .4em; position: absolute;"></i>
                                    </a>
                                </template>
                            </div>
                        </td>

                        <td v-if="options.showJailbreakColumn">
                            <template v-for="(jb, index) in fw.jailbreakArr" :key="jb">
                                <router-link :to="encodeURI(`/jailbreak/${jb.replace(/ /g, '-')}.html`)">
                                    {{ jb }}
                                </router-link>
                                <template v-if="index < fw.jailbreakArr.length - 1">, </template>
                            </template>
                            <template v-if="fw.jailbreakArr.length == 0">{{ naStr }}</template>
                        </td>

                        <td v-if="options.showDownloadColumn">
                            <template v-if="getFilteredDownloads(fw.downloads).length == 0">
                                {{ naStr }}
                            </template>
                            <template v-else-if="getFilteredDownloads(fw.downloads).length > 1 && fm.mainList">
                                <router-link :to="fw.url">{{ viewAllStr }}</router-link>
                            </template>
                            <div v-else v-for="dl in getFilteredDownloads(fw.downloads)" :key="dl" class="showOnHover">
                                <template v-if="getFilteredDownloads(fw.downloads).length > 1">{{ dl.deviceName }}: </template>
                                <a :href="dl.url">
                                    {{ dl.label }}
                                    <i class="fas fa-download opaqueHoverElement" style="margin-left: .4em; position: absolute;"></i>
                                </a>
                            </div>
                        </td>

                        <td v-if="options.showOtaColumn">
                            <template v-if="getFilteredDownloads(fw.otas).length == 0">
                                {{ naStr }}
                            </template>
                            <div v-else v-for="dl in getFilteredDownloads(fw.otas)" :key="dl" class="showOnHover">
                                <template v-if="getFilteredDownloads(fw.otas).length > 1">{{ dl.deviceName }}: </template>
                                <a :href="dl.url">
                                    {{ dl.label }}
                                    <i class="fas fa-download opaqueHoverElement" style="margin-left: .4em; position: absolute;"></i>
                                </a>
                            </div>
                        </td>

                        <td v-if="options.showReleasedColumn" style="width: 7em;">{{ (fw.releasedStr) ? fw.releasedStr : unknownDateStr }}</td>

                    </tr>
                </template>
            </table>
        </div>
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

export default {
    data() {
        return {
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
                return Array.from(new Set(dev.map(x => {
                    if (property == 'released' && x[property]) {
                        if (!Array.isArray(x[property])) x[property] = [x[property]]
                        x[property] = x[property].map(y => {
                            const releasedArr = y.split('-')
                            const dateStyleArr = [{ year: 'numeric'}, { dateStyle: 'medium'}, { dateStyle: 'medium'}]
                            const date = new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(new Date(y))
                            return date
                        })
                    }
                    return x[property]
                }).flat()))
                .sort()
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
                        url: [
                            this.devicePath,
                            'identifier',
                            x.identifier
                                .replace(/ /g,'-')
                                .replace(/ü/g,'u')
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
                    "showBuildColumn",
                    "showVersionColumn",
                    "showJailbreakColumn",
                    "showDownloadColumn",
                    "showOtaColumn",
                    "showReleasedColumn"
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
                },
                {
                    label: this.tableHeadObj.version,
                    value: this.options.showVersionColumn
                },
                {
                    label: this.tableHeadObj.jailbreak,
                    value: this.options.showJailbreakColumn
                },
                {
                    label: this.tableHeadObj.download,
                    value: this.options.showDownloadColumn
                },
                {
                    label: this.tableHeadObj.ota,
                    value: this.options.showOtaColumn
                },
                {
                    label: this.tableHeadObj.released,
                    value: this.options.showReleasedColumn
                }
            ].filter(x => x.value).map(x => x.label)
        }
    },
    methods: {
        checkWrap: function() {
            const flexImgs = document.getElementsByClassName('flexImg')
            const flexInfoWidth = document.getElementById('flexInfo').getBoundingClientRect().width

            const homeElement = document.getElementsByClassName('home')[0]
            var totalWidth = homeElement.clientWidth - parseFloat(window.getComputedStyle(homeElement).paddingLeft) - parseFloat(window.getComputedStyle(homeElement).paddingRight)
            var flexImgWidth = 0

            for (const i in flexImgs.length) {
                flexImgs[i].onload = () => {
                    flexImgWidth += flexImgs[i].clientWidth * Math.min(this.fm.img.count,3)
                    this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 10
                }
            }

            window.onresize = () => {
                totalWidth = totalWidth = homeElement.clientWidth - parseFloat(window.getComputedStyle(homeElement).paddingLeft) - parseFloat(window.getComputedStyle(homeElement).paddingRight)
                this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 10
            }
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
            
            const retArr = dlArr.filter(x => filterDev.includes(x.identifier))
            const urlCount = Array.from(new Set(retArr.map(x => x.url))).length

            if (urlCount == 1) return [retArr[0]]
            else return retArr
        }
    },
    mounted() {
        if (this.fm.noJb) {
            this.options.showReleasedColumn = true
            this.options.showJailbreakColumn = false
            this.options.showDownloadColumn = false
        }
        if (window.screen.width > 650) {
            this.options.showReleasedColumn = true
            if (this.fm.noJb) this.options.showDownloadColumn = true
        }
        if (this.fm.mainList) {
            this.options.filterDev = this.fm.deviceFilter[0].value
            this.options.showDownloadColumn = true
            this.options.showJailbreakColumn = false

            document.getElementById("showDownloadColumnCheckbox").disabled = true
        }
        else {
            this.checkWrap()
            this.options.filterDev = this.fm.deviceFilter[0].value
        }

        if (this.tabArr.length > 0) this.activeTab = this.tabArr[0]

        this.maxImgCount = this.fm.imgCount
    },
    watch: {
        imgCount(val) {
            if (val > this.maxImgCount - 1) this.imgCount = 0
        }
    }
}
</script>

<style scoped>
.flexImg1 {
    max-width: 100%;
    margin-left: 0 !important;
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
  float: left;
  margin: 0em 1.5em .5em 0em;
}

@media (min-width: 951px) {
  .tableOptionsWrapper {
      margin-bottom: 2.1em;
  }
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
</style>