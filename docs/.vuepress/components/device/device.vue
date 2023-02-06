<template>
    <template v-if="!fm.mainList">
        <deviceTitle :device="fm.device" :title="fm.title" :img="fm.img"/>
        <deviceInfo :device="fm.device" :extraInfo="fm.extraInfo"/>
        <groupedOrRelatedDeviceWrapper v-if="!fm.hideChildren" :device="fm.device" :img="fm.img"/>
    </template>

    <p v-if="fm.device[0].key == 'Polishing Cloth'">Dedicated to Aaron.</p>

    <firmwareVersionTableWrapper
        v-if="fm.versionArr && fm.versionArr.length > 0"
        :fmVersionArr="fm.versionArr"
        :deviceFilter="fm.deviceFilter"
        :mainList="fm.mainList"
        :hasFirmwares="fm.hasFirmwares"
        :hasFirmwareFilters="fm.hasFirmwareFilters"
        :devOptions="devOptions"
    />

    <p v-on:click="devOptions.show = true">AppleDB is not affiliated with Apple Inc.</p>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'

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
        }
    },
    methods: {
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