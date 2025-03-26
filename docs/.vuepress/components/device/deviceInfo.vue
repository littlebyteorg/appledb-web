<template>
    <div class="info">
        <div :class="[
            'leftColumn',
            'propertyBox',
            extraInfo ? '' : 'fillSpace'
        ]" v-if="computedProperties.map(x => x.infoString).filter(x => x).length">
            <template v-if="extraInfo">
                <div class="box separateBoxes" v-for="property in computedProperties" :key="property">
                    <div class="propertyWrapper" v-if="property.infoString"><deviceInfoProperty
                        :property="property"
                        :showAll="showAll"
                        :inline="false"
                    /></div>
                </div>
            </template>
            <div :class="[
                'box',
                'propertyBox',
                'mergedInlineBox'
            ]" v-else>
                <template v-for="property in computedProperties" :key="property">
                    <div class="propertyWrapper" v-if="property.infoString"><deviceInfoProperty
                        :property="property"
                        :showAll="showAll"
                        :inline="true"
                    /></div>
                </template>
            </div>
            <div :class="[
                'box',
                'propertyBox',
                'mergedBox'
            ]">
                <template v-for="property in computedProperties" :key="property"><div v-if="property.infoString" class="propertyWrapper">
                    <deviceInfoProperty
                        :property="property"
                        :showAll="showAll"
                        :inline="false"
                    />
                </div></template>
            </div>
        </div>
        <div v-if="extraInfo" :class="[
            'box',
            'rightColumn',
            computedProperties.length ? '' : 'fillSpaceRightColumn'
        ]">
            <extraInfo :tabArr="tabArr" :tabPropertyArr="tabPropertyArr" :tabData="tabData" :device="device"/>
            <!--<div class="tabWrapper">
                <div class="tabTitleWrapper" v-if="tabArr.length > 1">
                    <div
                        v-for="tab in tabArr"
                        :key="tab"
                        :class="[
                            'tabTitle',
                            activeTab == tab ? 'active' : ''
                        ]"
                        v-on:click="activeTab = tab"
                    >
                        {{ tab }}
                    </div>
                </div>
                <template v-for="tab in tabArr" :key="tab"><div class="tabContentWrapper" :style="{'margin-left': tabArr.length > 1 ? '' : '0'}" v-if="activeTab == tab"><div class="tabContent">
                    <template v-for="property in tabPropertyArr[tab]" :key="property">
                        <div class="title">{{ property.formatExtraInfoTitle() }}</div>
                        <div v-if="
                            Object.keys(tabData).length == 1 ||
                            Array.from(new Set(
                                Object.keys(tabData).map(x => 
                                    JSON.stringify(tabData[x][tab][property])
                                )))
                            .length == 1 &&
                            Object.keys(tabData).map(x => 
                                JSON.stringify(tabData[x][tab][property]))
                            .length != 1"
                        >
                            {{ tabData[Object.keys(tabData)[0]][tab][property].formatExtraInfoText(property) }}
                        </div>
                        <div v-else v-for="dev in Object.keys(tabData)" :key="dev" class="deviceStringWrapper">
                            <span class="deviceString"><router-link :to="`/device/identifier/${dev}.html`">{{ device.find(x => x.key == dev).name }}</router-link></span> 
                            <template v-if="tabData[dev] && tabData[dev][tab] && tabData[dev][tab][property]">
                                {{ tabData[dev][tab][property].formatExtraInfoText(property) }}
                            </template>
                            <template v-else>N/A</template>
                        </div>
                    </template>
                </div></div></template>
            </div>-->
        </div>
    </div>
</template>

<script>
String.prototype.format = function(vars) {
   let temp = this
   for (let item in vars)
     temp = temp.replace("${" + item + "}", vars[item])
   return temp
}

export default {
    data() {
        return {
            showAll: {},
            pageWidth: 0,

            properties: {
                identifier: {
                    title: 'Identifier',
                    string: '${i}'
                },
                soc: {
                    title: 'SoC',
                    string: '${i}'
                },
                arch: {
                    title: 'Arch',
                    string: '${i}'
                },
                model: {
                    title: 'Model',
                    string: '${i}'
                },
                board: {
                    title: 'Board',
                    string: '${i}'
                },
                color: {
                    title: 'Color',
                    string: '${i}'
                }
            },
        }
    },
    props: {
        device: Array,
        extraInfo: Object
    },
    computed: {
        computedProperties() {
            return Object.keys(this.properties).filter(x => {
                if (this.tabPropertyArr.hasOwnProperty('SoC')) {
                    if (this.tabPropertyArr.SoC.includes('SoC') && x == 'soc') return false
                    if (this.tabPropertyArr.SoC.includes('Architecture') && x == 'arch') return false
                }
                return true
            }).map(x => {
                let r = this.properties[x]
                r.key = x
                r.infoString = this.grabInfoString(x)
                return r
            }).filter(x => x.infoString)
        },
        tabArr() {
            if (!this.extraInfo) return []
            let retArr = Array.from(
                new Set(
                    Object.keys(this.extraInfo)
                    .map(x => this.extraInfo[x]).flat()
                    .map(x => x.type)
                )
            )
            if (!retArr.includes('SoC') && (
                this.grabInfoString('soc') || this.grabInfoString('arch')
            )) return ['SoC'].concat(retArr)
            return retArr
        },
        tabPropertyArr() {
            let retObj = {}
            if (!this.extraInfo) return retObj
            const arr = Object.keys(this.extraInfo).map(x => this.extraInfo[x]).flat()
            for (const i of arr) {
                if (!retObj.hasOwnProperty(i.type)) retObj[i.type] = Object.keys(i).filter(x => x != 'type')
                else retObj[i.type].concat(Object.keys(i.type).filter(x => x != 'type'))
            }

            if (this.tabArr.includes('SoC') && !Object.keys(retObj).includes('SoC')) {
                retObj.SoC = []
                if (this.grabInfoString('soc')) retObj.SoC.push('SoC')
                if (this.grabInfoString('arch')) retObj.SoC.push('Architecture')
            }
            
            return retObj
        },
        tabData() {
            let retObj = {}
            if (!this.extraInfo) return retObj
            for (const dev in this.extraInfo) {
                retObj[dev] = {}
                for (const tab of this.extraInfo[dev]) {
                    retObj[dev][tab.type] = {}
                    for (const property in tab) {
                        if (property == 'type') continue
                        retObj[dev][tab.type][property] = Array.isArray(tab[property]) ? tab[property] : [tab[property]]
                    }
                }

                if (this.tabArr.includes('SoC') && !Object.keys(retObj[dev]).includes('SoC')) {
                    retObj[dev].SoC = {}
                    let device = this.device.find(x => x.key == dev)
                    if (device.soc) retObj[dev].SoC.SoC = [device.soc]
                    if (device.arch) retObj[dev].SoC.Architecture = [device.arch]
                }
            }
            return retObj
        },
    },
    methods: {
        grabInfo(property) {
            if (property == 'released') {
                const dateArr = Array.from(new Set(this.device.map(x => x[property]).flat())).filter(x => x).sort().map(x => {
                    const dateOffset = (new Date().getTimezoneOffset() * 60 * 1000) + (60 * 60000)
                    const currentDate = new Date(x).valueOf()
                    const adjustedDate = new Date(currentDate + dateOffset)

                    const releasedArr = x.split('-')
                    const dateStyleArr = [{ year: 'numeric' }, { year: 'numeric', month: 'short' }, { dateStyle: 'medium' }]
                    const date = new Intl.DateTimeFormat('en-US', dateStyleArr[releasedArr.length-1]).format(adjustedDate)
                    
                    return date
                })
                return dateArr
            }

            return Array.from(new Set(this.device.map(x => x[property]).flat())).sort()
        },
        grabInfoString(property) {
            let info = this.grabInfo(property).filter(x => x)
            
            if (property == 'released' && info.length > 1) info = info.map(x => x.replace(',',''))
            info = info.join(', ')

            if (info) return this.properties[property].string.format({ i : info })
        }
    }
}
</script>

<style lang="scss" scoped>
.mergedBox {
    display: none !important;
}

.info {
    display: flex;
    flex-flow: row wrap;
    margin-block: 1em;

    .leftColumn {
        width: calc(38.2% - 1em);

        .box {
            margin-bottom: 1em;
            
            &:last-of-type {
                margin-bottom: 0;
            }
        }
    }

    .fillSpace {
        width: 100%;
    }

    .rightColumn {
        width: 55%;
        margin-left: auto;
        height: 0%;
    }

    .box.fillSpace {
        display: flex !important;
        flex-flow: row wrap !important;
        padding: .3em;

        .propertyWrapper {
            margin: 1.2em;
            
            &:first-of-type {
                margin-top: 1.2em;
            }
        }
    }

    .mergedInlineBox {
        margin-bottom: 0em !important;
    }

    .box {
        padding: .5em;
        border-radius: 10px;
        display: block;
        line-height: 1.4em;
        transition: background 150ms ease-in-out;

        a {
            color: var(--c-text-lightest);
            font-weight: 500;
        }

        .propertyWrapper {
            margin-top: .8em;

            &:first-of-type {
                margin-top: 0;
            }
        }

        .title {
            font-weight: 700;
            margin-block: 0 .4em;
            color: var(--c-text-light);
            text-transform: uppercase;
            font-size: .8em;
            margin-top: 1.5em;
            &:first-of-type {
                margin-top: 0;
            }
        }
    }
}

.rightColumn.fillSpaceRightColumn {
    margin-left: initial;
    width: 100%;
    margin-bottom: 1em;
}

@media screen and (max-width: 800px) {
    .info {
        display: flex;
        flex-direction: column;

        .leftColumn {
            width: 100%;
        }

        .rightColumn {
            margin-left: initial;
            width: initial;
            margin-bottom: 1em;
        }

        .propertyBox {
            display: block !important;
            flex-flow: row wrap !important;
            padding: 0em;
            margin-bottom: 1em;
            width: 100%;

            .propertyWrapper {
                margin-block: 1.2em;
                
                &:first-of-type {
                    margin-top: 1.2em;
                }
            }
        }

        .tabWrapper {
            margin: -.2em;
            .tabTitleWrapper {
                .tabTitle {
                    padding: .5em .7em;
                }
            }

            .tabContentWrapper {
                width: calc(100% - 8.65em);
            }
        }

        .mergedBox {
            display: initial;
        }
        .mergedInlineBox {
            display: none !important;
        }
        .separateBoxes {
            display: none;
        }

        .box {
            width: initial;

            margin-bottom: 1em;
            
            &:last-of-type {
                margin-bottom: 0;
            }
        }
    }
}
</style>