<template>
    <template v-if="!fm.mainList">
        <p class="flexWrapper" :style="(wrapImg) ? 'flex-direction: column;' : 'flex-direction: row;'">
            <ul class="infoList" id="flexInfo">
                <li v-for="(s, index) in infoArr" :key="s">
                    <template v-if="(infoArr[index].split(', ').length > 5 && !options.showAll[index])">
                        {{ s.replace(infoArr[index], infoArr[index].split(', ').slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="options.showAll[index] = true">...</a>
                    </template>
                    <template v-else>{{ s }}</template>
                </li>
            </ul>
            <img id="flexImg" :src="`/assets/images/device@1024/${fm.device.map(x => x.identifier)[0]}.png`" :style="`max-height: ${Object.keys(infoArr).length * 1.8}em; max-width: 100%; margin-left: ${(wrapImg) ? 'auto' : 0}; margin-right: ${(wrapImg) ? 'auto' : 0}; padding-top: ${(wrapImg) ? '1em' : 0};`">
        </p>


        <!--<p class="flexWrapper">
        <div id="flexInfo">
            <div v-for="(i, index) in infoData" :key="i">
            <template v-if="index == 'identifier' && deviceIdentifierArr.length > 5 && !showAllIdent">{{ i.replace(deviceIdentifierArr.join(', '), deviceIdentifierArr.slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="showAllIdent = true">...</a></template>
            <template v-else-if="index == 'model' && deviceModelArr.length > 5 && !showAllModel">{{ i.replace(deviceModelArr.join(', '), deviceModelArr.slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="showAllModel = true">...</a></template>
            <template v-else-if="index == 'board' && deviceBoardArr.length > 5 && !showAllBoard">{{ i.replace(deviceBoardArr.join(', '), deviceBoardArr.slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="showAllBoard = true">...</a></template>
            <template v-else>{{ i }}</template>
            </div>
        </div>
        <img id="flexImg" :src="`/assets/images/device@1024/${deviceIdentifierArr[0]}.png`" :style="`max-height: ${Object.keys(infoData).length * 1.8}em; max-width: 100%; margin-left: ${(wrapImg) ? 'auto' : 0}; margin-right: ${(wrapImg) ? 'auto' : 0}; padding-top: ${(wrapImg) ? '1em' : 0};`">
        </p>-->
        
        <template v-if="groupedOrRelatedDevicesObj.devices.length > 1">
            <h2>{{ groupedOrRelatedDevicesObj.header }}</h2>
            <ul>
                <li v-for="dev in groupedOrRelatedDevicesObj.devices" :key="dev">
                    <router-link :to="dev.url">
                        {{ dev.name }}
                    </router-link>
                </li>
            </ul>
        </template>

        <h2>{{ versionHeaderStr }}</h2>
    </template>

    <ul class="tableOptionsWrapper">
        <li style="margin-right: 1.5em;">
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
        <li v-if="fm.mainList">
            <label class="chartDropdown" for="deviceSelect">
                <i class="fas fa-filter"></i>
                {{ deviceStr }}
                <span class="arrow down" style="display: none;"></span>
            </label>
            <select v-model="options.filterDevType" style="margin-left: .5em;" name="deviceSelect" id="deviceSelect">
                <option v-for="type in fm.deviceTypeArr" :key="type">
                    {{ type }}
                </option>
            </select>
        </li>
    </ul>

    <div class="tableContainer" v-if="fm.versionArr">
        <table>
            <tr>
                <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
            </tr>
            <tr v-for="fw in fm.versionArr.filter(fw => {
                return (
                    (
                        (fw.beta && options.showBeta) ||
                        (!fw.beta && options.showStable) 
                    ) && (
                        fm.mainList && 
                        fw.deviceTypeArr.includes(options.filterDevType)
                    )
                )
            })" :key="fw">

                <td v-if="options.showBuildColumn" class="showOnHover">
                    <router-link :to="fw.url">{{ fw.build }}</router-link>
                    <template v-if="fw.downloads.length == 1 && !options.showDownloadColumn">
                        <a v-for="dl in fw.downloads" :key="dl" :href="dl.url">
                            <i class="fas fa-download hoverElement" style="margin-left: .4em; position: absolute;"></i>
                        </a>
                    </template>
                </td>
                
                <td v-if="options.showVersionColumn">
                    <template v-if="options.showBuildColumn">{{ fw.osStr }} {{ fw.version }}</template>
                    <div v-else class="showOnHover">
                        <router-link :to="fw.url">{{ fw.osStr }} {{ fw.version }}<template v-if="fw.duplicateVersion"> ({{ fw.build }})</template></router-link>
                        <template v-if="fw.downloads.length == 1 && !options.showDownloadColumn">
                            <a v-for="dl in fw.downloads" :key="dl" :href="dl.url">
                                <i class="fas fa-download hoverElement" style="margin-left: .4em; position: absolute;"></i>
                            </a>
                        </template>
                    </div>
                </td>

                <td v-if="options.showJailbreakColumn">
                    <template v-for="(jb, index) in fw.jailbreakArr" :key="jb">
                        <router-link :to="`/jailbreak/${jb.replace(/ /g, '-')}.html`">
                            {{ jb }}
                        </router-link>
                        <template v-if="index < fw.jailbreakArr.length - 1">, </template>
                    </template>
                    <template v-if="fw.jailbreakArr.length == 0">{{ naStr }}</template>
                </td>

                <td v-if="options.showDownloadColumn">
                    <div v-for="dl in fw.downloads" :key="dl" class="showOnHover">
                        <template v-if="dl.deviceName">{{ dl.deviceName }}: </template>
                        <a :href="dl.url">
                            {{ dl.label }}
                            <i class="fas fa-download opaqueHoverElement" style="margin-left: .4em; position: absolute;"></i>
                        </a>
                    </div>
                    <template v-if="fw.downloads.length == 0">
                        {{ naStr }}
                    </template>
                </td>

                <td v-if="options.showReleasedColumn" style="width: 7em;">{{ fw.releasedStr }}</td>
            </tr>
        </table>
    </div>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'

String.prototype.format = function(vars) {
  let temp = this;
  for (let item in vars)
    temp = temp.replace("${" + item + "}", vars[item]);
  return temp
}

export default {
    data() {
        return {
            infoStrArr: [
                "Identifier: ${identifier}",
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
                released: "Released"
            },
            optionsStr: 'Options',
            deviceStr: 'Device',
            naStr: 'N/A',

            optionsObjStr: {
                showBuildColumn: "Show build numbers",
                showVersionColumn: "Show version numbers",
                showJailbreakColumn: "Show jailbreaks",
                showDownloadColumn: "Show download links",
                showReleasedColumn: "Show release dates",
                showStable: "Show stable version",
                showBeta: 'Show beta versions'
            },

            options: {
                showBuildColumn: false,
                showVersionColumn: true,
                showJailbreakColumn: true,
                showDownloadColumn: false,
                showReleasedColumn: false,

                showStable: true,
                showBeta: false,

                showAll: {}
            },

            defaultFilter: 'iPhone, iPad, iPod',
            wrapImg: false,

            devicePath: '/device',
            fm: usePageFrontmatter()
        }
    },
    computed: {
        infoArr() {
            const dev = this.fm.device
            const grabInfo = (property) => Array.from(new Set(dev.map(x => x[property]))).sort().flat().join(', ')
            const propertyArr = [
                'identifier',
                'soc',
                'arch',
                'model',
                'board'
            ]
            var retObj = {}
            for (var str of this.infoStrArr) {
                const property = propertyArr.filter(x => str.includes(x))[0]
                retObj[property] = str.format({ [property]: grabInfo(property) })
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
                        url: [this.devicePath,x.identifier].join('/') + '.html'
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
                    label: this.tableHeadObj.released,
                    value: this.options.showReleasedColumn
                }
            ].filter(x => x.value).map(x => x.label)
        }
    },
    methods: {
        checkWrap: function() {
            const flexImg = document.getElementById('flexImg')
            const flexInfoWidth = document.getElementById('flexInfo').getBoundingClientRect().width

            const homeElement = document.getElementsByClassName('home')[0]
            var totalWidth = homeElement.clientWidth - parseFloat(window.getComputedStyle(homeElement).paddingLeft) - parseFloat(window.getComputedStyle(homeElement).paddingRight)
            var flexImgWidth = 0

            flexImg.onload = () => {
                flexImgWidth = flexImg.clientWidth
                this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 10
            }

            window.onresize = () => {
                totalWidth = totalWidth = homeElement.clientWidth - parseFloat(window.getComputedStyle(homeElement).paddingLeft) - parseFloat(window.getComputedStyle(homeElement).paddingRight)
                this.wrapImg = totalWidth < flexInfoWidth + flexImgWidth + 10
            }
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
        if (this.fm.mainList) document.getElementById("showDownloadColumnCheckbox").disabled = true
        else this.checkWrap()

        this.options.filterDevType = this.fm.deviceTypeArr[0]
        if (this.fm.deviceTypeArr.includes(this.defaultFilter)) this.options.filterDevType = this.defaultFilter
    }
}
</script>

<style scoped>
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
  margin: 0.2em 1.3em 1em 0em;
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
</style>