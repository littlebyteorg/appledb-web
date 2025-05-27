<template>
    <template v-if="!fm.mainList">
        <deviceTitle :color="colorName" :device="fm.device" :title="fm.title" :img="fm.img"/>
        <div v-if="adUnits && adUnits.length > 0" :id="`waldo-tag-${adUnits[0]}`"></div>
        <deviceInfo :device="fm.device" :extraInfo="fm.extraInfo"/>
        <template v-if="!fm.hideChildren">
            <groupedOrRelatedDeviceWrapper v-if="fm.subgroups.length" :device="fm.subgroups" :color="colorName" :colorGroup="colorGroup" :img="fm.img"/>
            <groupedOrRelatedDeviceWrapper v-else :device="fm.device" :color="colorName" :colorGroup="colorGroup" :img="fm.img"/>
        </template>
        <template v-if="this.colors && this.colors.length > 1">
            <h5>Color Selection</h5>
            <div class="wrapper">
                <div class="colorWrapper" v-for="color in this.colors">
                    <span v-on:click.prevent="changeColor(color)" class="dot" :class="(colorName == color.key || (colorGroup && colorGroup == color.group)) ? 'selected' : ''" :style=colorStyle(color.hex)></span>
                    <div class="title">{{color.name}}</div>
                </div>
            </div>
        </template>
    </template>

    <p v-if="fm.device[0].key == 'Polishing Cloth'">Dedicated to Aaron.</p>

    <firmwareVersionTableWrapper
        v-if="fm.versionArr && fm.versionArr.length > 0"
        :fmVersionArr="fm.versionArr"
        :deviceFilter="fm.deviceFilter"
        :mainList="fm.mainList"
        :hasFirmwares="fm.hasFirmwares"
        :hasFirmwareFilters="fm.hasFirmwareFilters"
        :show="fm.show"
        :devOptions="devOptions"
    />

    <div v-if="adUnits && adUnits.length > 1" :id="`waldo-tag-${adUnits[1]}`"></div>

    <p v-on:click="devOptions.show = true">AppleDB is not affiliated with Apple Inc.</p>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'
import { useThemeLocaleData } from '@vuepress/theme-default/lib/client/composables'

export default {
    props: {
        frontmatter: Object
    },
    data() {
        return {
            devOptions: {
                show: false
            },
            fm: this.frontmatter || usePageFrontmatter(),
            adUnits: useThemeLocaleData().value.adUnits,
            colorName: null,
            colorGroup: null
        }
    },
    computed: {
        colors() {
            if (this.fm.device.length == 1) return this.fm.device[0].colors
            let colors = {}
            for (const dev of this.fm.device) {
                if (!dev.colors) continue
                for (const color of dev.colors) {
                    const colorKey = (color.group || color.key || color.name)
                    let colorHex = color.hex
                    if (Array.isArray(colorHex)) colorHex = colorHex[0]
                    if (colors[colorKey]) {
                        if (Array.isArray(colors[colorKey].hex)) {
                            if (!colors[colorKey].hex.filter(x => x == colorHex)) colors[colorKey].hex.push(colorHex)
                        } else if (colors[colorKey].hex != colorHex) {
                            colors[colorKey].hex = [colors[colorKey].hex, colorHex]
                        }
                        continue
                    }
                    if (color.group) color.name = color.group
                    colors[colorKey] = color
                }
            }
            return Object.values(colors)
        }
    },
    mounted() {
        let query = this.$route.query
        if (query) {
            if (query.colorGroup) {
                const colorOption = this.colors.filter(x => x.group == query.colorGroup)[0]
                this.colorName = colorOption.key || colorOption.name
                this.colorGroup = query.colorGroup
            }
            else if (query.color) {
                this.colorName = query.color
            }
        }
    },
    created() {
        if (this.fm.device[0].colors) {
            this.changeColor(this.fm.device[0].colors[this.fm.device[0].colors.length - 1])
        }
    },
    methods: {
        colorStyle: function(colorHex) {
            if (Array.isArray(colorHex)) {
                return {
                    "backgroundColor": "#" + colorHex[colorHex.length - 1],
                    "backgroundImage": "-webkit-linear-gradient(-45deg, #" + colorHex[0] + " 50%, #" + colorHex[1] + " 50%)"
                }
            }
            return {"backgroundColor": "#" + colorHex}
        },
        changeColor: function(color) {
            this.colorName = color.key || color.name
            this.colorGroup = color.group || ""
            this.fm.device[0].color = color.name
            this.fm.device[0].released = color.released
        }
        /*checkScroll: function() {
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
        }*/
    }
}
</script>
<style lang="scss" scoped>
.title {
    font-weight: 700;
    margin-block: 0 .4em;
    color: var(--c-text-light);
    font-size: .8em;

    margin-top: 1.5em;
    &:first-of-type {
        margin-top: 0;
    }
}
.wrapper {
    display: flex;
    overflow-x: auto;
    padding-block: 2em 1.5em;
    padding-inline: 2em;
    margin-inline: -1em;
}
.colorWrapper {
    padding-inline: 2em;
    margin-inline: -1em;
    width: 5em;
    text-align: center;
}
.dot {
  height: 50px;
  width: 50px;
  border-radius: 50%;
  display: inline-block;
  border: 2px solid var(--c-border);
  &.selected {
    border: 2px solid var(--c-tip);
  }
}
</style>