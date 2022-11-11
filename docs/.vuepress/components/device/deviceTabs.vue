<template>
    <div class="tab-container">
        <section v-for="(tab,index) in tabArr" :key="tab">
            <input :id="tab" type="radio" :checked="activeTab == tab">
            <label :for="tab" class="tab-link" v-on:click="activeTab = tab">
                {{ tab.formatExtraInfoTitle() }}
            </label>
            <div :class="`tab ${(index == tabArr.length - 1) ? 'tab-last' : ''}`" style="overflow-x: auto; padding: 0;">
                <table style="margin: 0;">
                    <tr style="border: none;" v-if="Object.keys(extraInfo).length > 1 && [Object.keys(tabData).map(x => tabData[x][tab])].map(d => Array.from(new Set(d.map(y => JSON.stringify(Object.keys(y).map(x => y[x]))))).length)[0] > 1"><th/><th v-for="dev in Object.keys(extraInfo)" :key="dev">{{ device.filter(x => x.key == dev)[0].name }}</th></tr>
                    <tr style="border: none;" v-for="property in tabPropertyArr[tab]" :key="property">
                        <td style="border: none;">{{ property.formatExtraInfoTitle() }}</td>
                        <td style="border: none;" v-if="Array.from(new Set(Object.keys(tabData).map(x => JSON.stringify(tabData[x][tab][property])))).length == 1 && Object.keys(tabData).map(x => JSON.stringify(tabData[x][tab][property])).length != 1" :colspan="Object.keys(extraInfo).length">
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
</template>

<script>
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
    props: {
        extraInfo: Object,
        tabData: Object,
        device: Object
    },
    data() {
        return {
            activeTab: ''
        }
    },
    computed: {
        tabArr() {
            if (!this.extraInfo) return []
            return Array.from(
                new Set(
                    Object.keys(this.extraInfo)
                    .map(x => this.extraInfo[x]).flat()
                    .map(x => x.type)
                )
            )
        },
        tabPropertyArr() {
            const arr = Object.keys(this.extraInfo).map(x => this.extraInfo[x]).flat()
            let retObj = {}
            for (const i of arr) {
                if (!retObj.hasOwnProperty(i.type)) retObj[i.type] = Object.keys(i).filter(x => x != 'type')
                else retObj[i.type].concat(Object.keys(i.type).filter(x => x != 'type'))
            }
            return retObj
        },
        tabData() {
            let retObj = {}
            for (const dev in this.extraInfo) {
                retObj[dev] = {}
                for (const tab of this.extraInfo[dev]) {
                    retObj[dev][tab.type] = {}
                    for (const property in tab) {
                        if (property == 'type') continue
                        retObj[dev][tab.type][property] = Array.isArray(tab[property]) ? tab[property] : [tab[property]]
                    }
                }
            }
            return retObj
        },
    },
    mounted() {
        if (this.tabArr.length > 0) this.activeTab = this.tabArr[0]
    }
}
</script>

<style lang="scss" scoped>
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
</style>